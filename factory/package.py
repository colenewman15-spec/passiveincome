import os, sys, zipfile, json, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS = os.path.join(ROOT, 'products')
DIST = os.path.join(ROOT, 'dist')
os.makedirs(DIST, exist_ok=True)

def package(slug):
    src = os.path.join(PRODUCTS, slug)
    if not os.path.isdir(src):
        print('Product not found:', src); return None
    out = os.path.join(DIST, slug + '.zip')
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(src):
            for f in files:
                full = os.path.join(root, f)
                arc = os.path.relpath(full, src)
                z.write(full, arc)
    print('Packaged:', out)
    return out

if __name__ == '__main__':
    if len(sys.argv) < 2:
        # package all
        for slug in sorted(os.listdir(PRODUCTS)):
            p = os.path.join(PRODUCTS, slug)
            if os.path.isdir(p):
                package(slug)
    else:
        package(sys.argv[1])