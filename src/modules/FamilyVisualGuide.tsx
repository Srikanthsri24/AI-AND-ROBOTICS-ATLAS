import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { familyVisual, type HardwareFamily } from '../data/hardware';
import { imageHotspots, type ImageHotspot } from '../data/image-hotspots';
import imageDimensions from '../data/hardware/image-dimensions.json';
import FamilySchematic from './FamilySchematic';

function PartShape({ part }: { part: ImageHotspot }) {
  const { x, y, region } = part;
  if (typeof region[0] !== 'number') {
    return <polygon points={(region as readonly (readonly [number, number])[]).map(pair => pair.join(',')).join(' ')} vectorEffect="non-scaling-stroke"/>;
  }
  const [w, h, angle, shape] = region as readonly [number, number, number, 'oval' | 'box'];
  const transform = angle ? `rotate(${angle} ${x} ${y})` : undefined;
  return shape === 'oval'
    ? <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} transform={transform} vectorEffect="non-scaling-stroke"/>
    : <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={Math.min(w, h) * .16} transform={transform} vectorEffect="non-scaling-stroke"/>;
}

function PartHighlight({ part }: { part: ImageHotspot }) {
  const maskId = useId();
  return <svg className="ha-part-highlight" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <mask id={maskId} x="0" y="0" width="100" height="100" maskUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="white"/>
        <g fill="black"><PartShape part={part}/></g>
      </mask>
    </defs>
    <rect className="ha-part-veil" width="100" height="100" mask={`url(#${maskId})`}/>
    <g className="ha-part-halo"><PartShape part={part}/></g>
    <g className="ha-part-outline"><PartShape part={part}/></g>
  </svg>;
}

export default function FamilyVisualGuide({ family }: { family: HardwareFamily }) {
  const [selected, setSelected] = useState(0);
  const hotspots = imageHotspots[family.id] ?? [];
  const activePart = hotspots[selected];
  const visual = familyVisual(family, 1280);
  const { photo } = visual;
  const [width, height] = (imageDimensions as Partial<Record<string, number[]>>)[family.id] ?? [1280, 853];
  const caption = visual.generated
    ? 'AI-generated illustration'
    : photo?.label ?? 'Collection illustration';

  return (
    <>
      <h2 className="ha-visual-title">Inspect the hardware</h2>
      <div className="ha-visual-board">
        <figure className={`ha-visual-figure${photo ? ' ha-visual-figure-photo' : ''}`}>
          <div className="ha-hotspot-image">
            <img src={visual.src} alt={visual.alt} width={width} height={height} style={{ aspectRatio: `auto ${width} / ${height}` }}/>
            {activePart && <PartHighlight part={activePart}/>}
            {hotspots.map((part, index) => (
              <button
                key={part.name}
                type="button"
                className={part.x >= 50 ? "ha-hotspot ha-hotspot-left" : "ha-hotspot"}
                style={{ left: `${part.x}%`, top: `${part.y}%` }}
                aria-label={part.name}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span aria-hidden="true">{index + 1}</span>
                <span className="ha-hotspot-label" aria-hidden="true">{part.name}</span>
              </button>
            ))}
          </div>
          <figcaption>
            <strong>{caption}</strong>
            {photo && <span>
              Photo by {photo.credit}
              {photo.license?.startsWith('https://')
                ? <> · <a href={photo.license} target="_blank" rel="noreferrer">
                    {photo.license.includes('/by-nc-sa/') ? 'CC BY-NC-SA 3.0' : 'CC BY-SA 3.0'}
                  </a> · Resized for the Atlas</>
                : photo.license && ` · ${photo.license}`}
            </span>}
          </figcaption>
        </figure>
        {activePart && (
          <div className="ha-part-inspector">
            <p className="ha-inspector-hint">Select a label to highlight the part and see how it fits.</p>
            <ul className="ha-part-list" aria-label="Parts shown in the image">
              {hotspots.map((part, index) => (
                <li key={part.name}>
                  <button type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>
                    <span aria-hidden="true">{index + 1}</span> {part.name}
                  </button>
                </li>
              ))}
            </ul>
            <div aria-live="polite">
              <h3>{activePart.name}</h3>
              <dl>
                <dt>What it does</dt><dd>{activePart.function}</dd>
                <dt>How it connects</dt><dd>{activePart.connection}</dd>
              </dl>
            </div>
          </div>
        )}
      </div>
      <details className="ha-schematic-disclosure">
        <summary>Explore the simplified diagram <ChevronDown size={18} aria-hidden="true"/></summary>
        <FamilySchematic family={family}/>
      </details>
    </>
  );
}
