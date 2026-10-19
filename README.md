# Fisheye SMS — Remotion recreation

A component-based reconstruction of the Motion Face clip **鱼眼畸变效果（Fisheye + 摩尔纹 + 暗角）**.

- Recording: `7f6a33d3-83e5-4c41-89fe-0910881e46c6`
- Reference page: https://motionface.cc/?recording=7f6a33d3-83e5-4c41-89fe-0910881e46c6
- Composition: `FisheyeSMS` · 1080 × 1102 · 30 fps · 60 frames / 2 seconds
- Silent, matching the reference's effectively silent audio track.

## Run

Requires Node.js 22 LTS or newer and npm. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the Studio URL printed by Remotion (normally http://localhost:3000/FisheyeSMS).

## Render

```sh
npm run render
npm run still
npm run lint
npm run build
```

Outputs: `out/fisheye-sms.mp4` and `out/preview.png` (frame 40).
For a machine without hardware WebGL, use:

```sh
npm run render -- --concurrency=1 --gl=swangle
```

The **Verify and render** GitHub Actions workflow also performs a clean install,
checks TypeScript and ESLint, bundles the project, renders the MP4 and three
keyframes, and uploads the results as a downloadable workflow artifact.

## How it works

`src/Fisheye.tsx` draws the SMS interface as editable Canvas 2D text and geometry.
A WebGL fragment shader applies radial fisheye distortion, a gently oscillating
camera angle, two interfering scanline frequencies, and a radial vignette.
All motion derives from `useCurrentFrame()` and `useVideoConfig()`; there are no
wall-clock animations or random values. The yellow marker begins at 0.88 seconds
and expands over 0.58 seconds.

The three composition props in `src/Root.tsx` control distortion, moiré intensity,
and vignette strength. The message and avatar geometry are editable in
`drawPhone()`. Chinese typography uses the bundled **Noto Sans SC** font, under
its accompanying SIL Open Font License (`public/OFL.txt`).

This is a procedural visual reconstruction, not a pixel-identical extraction.
The original phone's exact font and optical processing are approximated.
The reference MP4, signed download URL, and repository-binding credential are
not included, and no runtime request to Motion Face is required.

See [reference analysis](docs/reference-analysis.md) for framing and timing notes.
