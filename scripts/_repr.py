for f in ['src/frontend/components/ui/Badge.tsx','src/frontend/components/layout/Container.tsx']:
    data=open(f,'rb').read()
    print('FILE',f,'LEN',len(data))
    print(repr(data[-200:]))
    print('---')
