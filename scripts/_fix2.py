files = [
 ('src/frontend/components/ui/Badge.tsx', 'export default Badge;'),
 ('src/frontend/components/layout/Container.tsx', 'export default Container;'),
]
for f, marker in files:
    data = open(f,'rb').read().decode('utf-8')
    idx = data.find(marker)
    if idx != -1:
        end = idx + len(marker)
        if end < len(data) and data[end] == '\n':
            end += 1
        clean = data[:end]
        open(f,'w',encoding='utf-8',newline='\n').write(clean)
        print('fixed', f, 'len', len(clean))