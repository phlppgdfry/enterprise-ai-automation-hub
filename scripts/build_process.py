"""Generate non-executable BPMN 2.0 + editable SVG from one declarative local-process model."""
from pathlib import Path
import xml.etree.ElementTree as ET
from html import escape
ROOT=Path(__file__).resolve().parents[1]
NS='http://www.omg.org/spec/BPMN/20100524/MODEL';DI='http://www.omg.org/spec/BPMN/20100524/DI';DC='http://www.omg.org/spec/DD/20100524/DC';DDI='http://www.omg.org/spec/DD/20100524/DI'
for prefix,uri in [('',NS),('bpmndi',DI),('dc',DC),('di',DDI)]:ET.register_namespace(prefix,uri)
MODELS={
 'as-is':dict(title='Current manual process — fictional assumption',lanes=['Employee','Reviewer'],nodes=[
 ('start','startEvent','Need identified',0,100,100),('mail','userTask','Email request',0,230,90),
 ('find','userTask','Find reviewer',0,440,90),('decide','userTask','Decision in email',1,650,240),
 ('end','endEvent','Manual follow-up',1,900,250)],edges=[('start','mail',''),('mail','find',''),('find','decide',''),('decide','end','')]),
 'to-be':dict(title='Local reference — rules route; a human decides',lanes=['Employee','API / local storage','Human reviewer'],nodes=[
 ('start','startEvent','Need identified',0,95,95),('submit','userTask','Confirm request',0,205,85),
 ('validate','serviceTask','Validate and route',1,410,235),('valid','exclusiveGateway','Valid input?',1,600,250),
 ('correct','userTask','Show error / correct',0,665,85),('review','userTask','Review with reason',2,760,385),
 ('choice','exclusiveGateway','Human decision',2,960,400),
 ('approved','serviceTask','Save approved + audit',1,1040,215),('rejected','serviceTask','Save rejected + audit',1,1040,280),
 ('yes','endEvent','Approved',1,1280,225),('no','endEvent','Rejected',1,1280,310)],
 edges=[('start','submit',''),('submit','validate',''),('validate','valid',''),('valid','correct','Invalid'),
 ('correct','submit','Resubmit'),('valid','review','Valid'),('review','choice',''),
 ('choice','approved','Approve'),('choice','rejected','Reject'),('approved','yes',''),('rejected','no','')])}

def outputs():
    out={}
    for name,m in MODELS.items():
        width=1380 if name=='to-be' else 1080;height=560 if name=='to-be' else 410
        defs=ET.Element('{'+NS+'}definitions',id=name+'Definitions',targetNamespace='https://example.org/noordwerk')
        process=ET.SubElement(defs,'{'+NS+'}process',id=name.replace('-',''),isExecutable='false')
        lanes=ET.SubElement(process,'{'+NS+'}laneSet',id=name+'LaneSet')
        for index,label in enumerate(m['lanes']):
            lane=ET.SubElement(lanes,'{'+NS+'}lane',id='lane'+str(index),name=label)
            for identity,_,_,owner,_,_ in m['nodes']:
                if owner==index:ET.SubElement(lane,'{'+NS+'}flowNodeRef').text=identity
        shapes={}
        for identity,kind,label,owner,x,y in m['nodes']:
            w,h=(36,36) if 'Event' in kind else ((48,48) if 'Gateway' in kind else (160,65))
            shapes[identity]=(x,y,w,h)
            ET.SubElement(process,'{'+NS+'}'+kind,id=identity,name=label)
        for index,(source,target,label) in enumerate(m['edges']):
            ET.SubElement(process,'{'+NS+'}sequenceFlow',id='flow'+str(index),sourceRef=source,targetRef=target,name=label)
        diagram=ET.SubElement(defs,'{'+DI+'}BPMNDiagram',id=name+'Diagram')
        plane=ET.SubElement(diagram,'{'+DI+'}BPMNPlane',id=name+'Plane',bpmnElement=process.get('id'))
        for index in range(len(m['lanes'])):
            shape=ET.SubElement(plane,'{'+DI+'}BPMNShape',id='laneShape'+str(index),bpmnElement='lane'+str(index),isHorizontal='true')
            ET.SubElement(shape,'{'+DC+'}Bounds',x='20',y=str(50+index*150),width=str(width-40),height='150')
        svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(m["title"])}</title><desc id="desc">Non-executable fictional process with employee, API and reviewer lanes. No AI approval or deployed escalation.</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#547083"/></marker></defs><rect width="100%" height="100%" fill="white"/><g font-family="Arial, sans-serif" fill="#20384a"><text x="24" y="30" font-size="20" font-weight="bold">{escape(m["title"])}</text>']
        for index,label in enumerate(m['lanes']):
            y=50+index*150
            svg.append(f'<rect x="20" y="{y}" width="{width-40}" height="150" fill="#f3f6f8" stroke="#d5e0e6"/><text x="30" y="{y+28}" font-size="13">{escape(label)}</text>')
        for index,(source,target,label) in enumerate(m['edges']):
            sx,sy,sw,sh=shapes[source];tx,ty,tw,th=shapes[target]
            points=[(sx+sw,sy+sh/2),(tx,ty+th/2)]
            if tx<sx:points=[(sx+sw/2,sy),(sx+sw/2,sy-20),(tx+tw/2,sy-20),(tx+tw/2,ty)]
            edge=ET.SubElement(plane,'{'+DI+'}BPMNEdge',id='edge'+str(index),bpmnElement='flow'+str(index))
            for x,y in points:ET.SubElement(edge,'{'+DDI+'}waypoint',x=str(x),y=str(y))
            svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in points)+'" fill="none" stroke="#547083" stroke-width="1.5" marker-end="url(#arrow)"/>')
            if label:
                lx,ly=((960,300 if label=='Approve' else 370) if source=='choice' else ((points[0][0]+points[-1][0])/2,(points[0][1]+points[-1][1])/2-7))
                svg.append(f'<text x="{lx}" y="{ly}" font-size="11">{escape(label)}</text>')
        for identity,kind,label,owner,x,y in m['nodes']:
            _,_,w,h=shapes[identity]
            shape=ET.SubElement(plane,'{'+DI+'}BPMNShape',id=identity+'Shape',bpmnElement=identity)
            ET.SubElement(shape,'{'+DC+'}Bounds',x=str(x),y=str(y),width=str(w),height=str(h))
            if 'Event' in kind:svg.append(f'<circle cx="{x+w/2}" cy="{y+h/2}" r="18" fill="white" stroke="#096b62" stroke-width="{3 if kind=="endEvent" else 1.5}"/>')
            elif 'Gateway' in kind:svg.append(f'<path d="M{x+w/2} {y}L{x+w} {y+h/2}L{x+w/2} {y+h}L{x} {y+h/2}Z" fill="white" stroke="#096b62"/>')
            else:svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="white" stroke="#096b62"/>')
            svg.append(f'<text x="{x+w/2}" y="{y+h/2+4 if "Task" in kind else y+h+16}" text-anchor="middle" font-size="12">{escape(label)}</text>')
        svg.append(f'<text x="24" y="{height-18}" font-size="12" fill="#5c6e7a">Synthetic local scope. No cancellation endpoint, file upload, scheduler or automatic approval. AI policy experiment is a separate read-only path.</text></g></svg>')
        ET.indent(defs,space='  ')
        out[ROOT/'process'/f'{name}.bpmn']=ET.tostring(defs,encoding='unicode')+'\n'
        out[ROOT/'docs/assets'/f'{name}-process.svg']='\n'.join(svg)+'\n'
    return out

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    for path,content in outputs().items():
        if args.check:
            if path.read_text()!=content:raise SystemExit('Stale process artifact: '+str(path))
        else:path.write_text(content)
    print('BPMN/SVG process artifacts '+('current' if args.check else 'generated'))
