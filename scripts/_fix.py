import os

files = [
 'src/frontend/components/layout/Container.tsx',
 'src/frontend/components/ui/Badge.tsx',
]
for f in files:
    data = open(f,'rb').read()
    marker = b'xml<|message|><rfl:parameter name="path">'
    idx = data.find(marker)
    if idx != -1:
        # find preceding newline
        nl = data.rfind(b'\n', 0, idx)
        clean = data[:nl+1] if nl != -1 else data[:idx]
        open(f,'wb').write(clean)
        print('fixed', f, 'newlen', len(clean))
PYEOF
python D:\OGMOP\scripts\_fix.py