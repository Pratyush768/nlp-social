from flask import Flask, jsonify, request
import json
from pathlib import Path
from backend.nlp_pipeline import analyze_post

# Add this import
from flask_cors import CORS

app = Flask(__name__)

# Add this line right after you create the Flask app instance
CORS(app)

DATA_PATH = Path(__file__).parent / 'seed_data.json'

if not DATA_PATH.exists():
    raise FileNotFoundError('seed_data.json not found. Run generate_seed.py to create it.')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    POSTS = json.load(f)
    
    
# ✅ Root route for quick check
@app.route('/')
def index():
    return jsonify({
        "message": "Backend is running!",
        "endpoints": ["/api/posts", "/api/posts/<id>", "/api/process_all", "/api/analyze"]
    })

@app.route('/api/posts', methods=['GET'])
def list_posts():
    # optional filters
    disaster = request.args.get('disaster')
    dtype = request.args.get('type')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 30))

    items = POSTS
    if disaster is not None:
        if disaster.lower() in ('1','true','yes'):
            items = [p for p in items if p.get('labels', {}).get('disaster')]
        else:
            items = [p for p in items if not p.get('labels', {}).get('disaster')]
    if dtype:
        items = [p for p in items if p.get('labels', {}).get('type') == dtype]

    # simple pagination
    start = (page-1)*per_page
    end = start + per_page
    return jsonify({
        'total': len(items),
        'page': page,
        'per_page': per_page,
        'posts': items[start:end]
    })

@app.route('/api/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    post = next((p for p in POSTS if p['id'] == post_id), None)
    if not post:
        return jsonify({'error': 'not found'}), 404
    # compute NLP on-the-fly
    analysis = analyze_post(post['text'])
    post_with_analysis = {**post, 'nlp': analysis}
    return jsonify(post_with_analysis)

@app.route('/api/process_all', methods=['POST'])
def process_all():
    for p in POSTS:
        p['nlp'] = analyze_post(p['text'])
    # overwrite file
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(POSTS, f, ensure_ascii=False, indent=2)
    return jsonify({'status': 'done', 'processed': len(POSTS)})

# ✅ New: analyze any text directly
@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "Missing 'text' in request"}), 400
    result = analyze_post(text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
