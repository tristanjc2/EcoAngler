from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index/index.html')

@app.route('/about')
def about():
    return render_template('about/about.html')

@app.route('/locator')
def locator():
    return render_template('locator/locator.html')

@app.route('/contact')
def contact():
    return render_template('contact/contact.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0',port='5000',debug=True)