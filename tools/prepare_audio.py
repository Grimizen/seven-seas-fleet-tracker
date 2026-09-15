"""Trim user-supplied originals; run with SOURCE_DIR and an ffmpeg executable."""
import argparse, subprocess, json
from pathlib import Path
import numpy as np
parser=argparse.ArgumentParser();parser.add_argument('source',type=Path);parser.add_argument('ffmpeg');args=parser.parse_args()
out=Path('dist/audio');out.mkdir(parents=True,exist_ok=True)
edits=[
 ('cannon-1','universfield-powerful-cannon-shot-02-487887.mp3',0,.9),
 ('cannon-2','lordsonny-cannon-fire-161072.mp3',0,3),
 ('sails-stowed','floraphonic-rope-tighten-knot-4-199788.mp3',.15,1),
 ('sails-half','freesound_community-large-rope-pulley-operated-70719.mp3',1.8,2.6),
 ('sails-full','freesound_community-saildeploy-99393.mp3',1.1,3),
 ('crew-1','freesound_community-male-hurt-sound-95206.mp3',.12,.6),
 ('crew-2','freesound_community-male_hurt7-48124.mp3',.06,.6),
 ('damage-1','freesound_community-wooden-ship-break-85277.mp3',0,1.5),
 ('damage-2','freesound_community-wooden-ship-break-85277.mp3',1.2,1.5),
]
manifest=[]
for name,source,start,duration in edits:
 raw=subprocess.check_output([args.ffmpeg,'-v','error','-ss',str(start),'-t',str(duration),'-i',str(args.source/source),'-ac','1','-ar','44100','-f','f32le','-'])
 samples=np.frombuffer(raw,dtype=np.float32);gain=.8/max(.001,float(np.max(np.abs(samples))))
 target=out/(name+'.mp3')
 filters=f'volume={gain},afade=t=in:d=0.005,afade=t=out:st={duration-.08}:d=0.08'
 subprocess.run([args.ffmpeg,'-v','error','-y','-ss',str(start),'-t',str(duration),'-i',str(args.source/source),'-af',filters,'-ac','1','-ar','44100','-codec:a','libmp3lame','-b:a','96k',str(target)],check=True)
 manifest.append(dict(file=target.name,source=source,startSeconds=start,durationSeconds=duration))
 print(target.name,target.stat().st_size)
(out/'credits.json').write_text(json.dumps({'source':'Audio files supplied by the project owner. Original filenames retain creator credits; no additional licence claim is made here.','edits':manifest},indent=2)+'\n',encoding='utf-8')
