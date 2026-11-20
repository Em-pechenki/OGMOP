import os
markers=[b'xml<|message|><rfl:parameter name="path">', b'xml<|message|><rfl:parameter name="command">', b'xml<|message|><rfl:parameter name="content">', b'tool_calls>']
for root,_,fs in os.walk('src'):
    for f in fs:
        p=os.path.join(root,f)
        try:
            data=open(p,'rb').read()
        except Exception:
            continue
        for m in markers:
            if m in data:
                print('MARKER', m, 'in', p)
print('done')
