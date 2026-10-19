import React, { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  cancelRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type FisheyeProps = {
  distortion: number;
  moire: number;
  vignette: number;
};
const vertex = `attribute vec2 position; varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
varying vec2 uv; uniform sampler2D scene; uniform vec2 resolution;
uniform float time; uniform float distortion; uniform float moire; uniform float vignette;
void main(){
 vec2 p=vec2(uv.x,1.-uv.y)*resolution;
 float phase=time*3.14159265;
 vec2 center=vec2(580.+38.*sin(phase),545.);
 vec2 q=(p-center)/vec2(600.,650.);
 float r=dot(q,q);
 vec2 samplePx=center+(p-center)*(1.+distortion*r);
 float angle=.035*sin(phase-.25)+.035;
 vec2 d=samplePx-center;
 samplePx=center+mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*d;
 samplePx.y+=22.*sin(phase);
 vec2 st=(samplePx+vec2(240.,150.))/vec2(1560.,1402.);
 vec3 color=texture2D(scene,st).rgb;
 float fine=sin(p.y*3.08+.18*sin(p.x*.032+time));
 float beat=sin(p.y*.43+p.x*.015+sin(p.x*.004)*4.);
 color*=1.-moire*(.46+.28*fine+.26*beat);
 float edge=clamp(dot((p-resolution*.5)/(resolution*.72),(p-resolution*.5)/(resolution*.72)),0.,1.);
 color*=1.-vignette*edge;
 gl_FragColor=vec4(color,1.);
}`;

function drawPhone(ctx: CanvasRenderingContext2D, frame: number, fps: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 1560, 1402);
  ctx.save();
  ctx.translate(240, 150);
  ctx.fillStyle = "#111112";
  ctx.fillRect(-240, -150, 1560, 355);
  ctx.fillStyle = "#818a96";
  ctx.beginPath();
  ctx.ellipse(590, -34, 130, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e0e2e3";
  ctx.beginPath();
  ctx.arc(590, -62, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(590, 23, 83, 37, 0, Math.PI, 2 * Math.PI);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.font = "56px Arial";
  ctx.fillStyle = "#ddd";
  ctx.save();
  ctx.translate(590, 155);
  ctx.scale(1.18, 1);
  ctx.fillText("10688037970779", 0, 0);
  ctx.restore();
  ctx.fillStyle = "#666";
  ctx.font = "48px Arial";
  ctx.fillText("›", 865, 155);
  ctx.fillStyle = "#087ec1";
  ctx.beginPath();
  ctx.roundRect(-230, 38, 70, 41, 20);
  ctx.fill();
  ctx.font = "italic 29px Arial";
  ctx.fillStyle = "#95d3f0";
  ctx.fillText("52", -195, 69);
  ctx.fillStyle = "#b5b5b8";
  ctx.font = "27px Arial";
  ctx.fillText("▥  ≋  ▰₃₄", 1220, -150);
  ctx.fillStyle = "#88888b";
  ctx.font = "48px ReplicaSans";
  ctx.fillText("信息 · 短信", 590, 320);
  ctx.fillText("前天 21:07", 590, 374);
  ctx.fillStyle = "#272729";
  ctx.beginPath();
  ctx.roundRect(-450, 448, 1700, 500, 68);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.font = "76px ReplicaSans";
  ctx.fillStyle = "#e3e3e5";
  const lines = [
    "【浙江大学】欢迎您在 2026年09月04",
    "日~2026年09月04日访问紫金港校区。",
    "请凭支付宝 “浙大通” 小程序通行码或本人",
    "身份证进入校园。",
  ];
  const x = -300,
    y = 560,
    lineHeight = 95;
  // The reference starts revealing the marker at approximately 0.9 seconds.
  const reveal = Math.max(0, Math.min(1, (frame / fps - 0.88) / 0.58));
  const prefix = ctx.measureText("请凭支付宝 “").width;
  ctx.fillStyle = "#d6bd0b";
  ctx.fillRect(
    x + prefix,
    y + lineHeight * 2 - 78,
    ctx.measureText("浙大").width * reveal,
    96,
  );
  ctx.fillStyle = "#e3e3e5";
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  ctx.strokeStyle = "#b6b6b7";
  ctx.lineWidth = 2;
  const underline = (text: string, start: number, end: number, row: number) => {
    ctx.beginPath();
    ctx.moveTo(
      x + ctx.measureText(text.slice(0, start)).width,
      y + row * lineHeight + 10,
    );
    ctx.lineTo(
      x + ctx.measureText(text.slice(0, end)).width,
      y + row * lineHeight + 10,
    );
    ctx.stroke();
  };
  underline(lines[0], 12, lines[0].length, 0);
  underline(lines[1], 0, 17, 1);
  ctx.restore();
}

export const Fisheye: React.FC<FisheyeProps> = ({
  distortion,
  moire,
  vignette,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [fontHandle] = useState(() => delayRender("Load bundled Chinese font"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const font = new FontFace(
      "ReplicaSans",
      `url(${staticFile("NotoSansSC.ttf")})`,
    );
    font
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        setReady(true);
        continueRender(fontHandle);
      })
      .catch((e) => {
        cancelRender(e);
      });
  }, [fontHandle]);
  useEffect(() => {
    if (!ready || !canvas.current) return;
    const gl = canvas.current.getContext("webgl", {
      preserveDrawingBuffer: true,
      alpha: false,
    });
    if (!gl) throw new Error("WebGL is required");
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? "Shader error");
      return s;
    };
    const vs = shader(gl.VERTEX_SHADER, vertex),
      fs = shader(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const source = document.createElement("canvas");
    source.width = 1560;
    source.height = 1402;
    drawPhone(source.getContext("2d")!, frame, fps);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.uniform2f(gl.getUniformLocation(program, "resolution"), width, height);
    for (const [key, value] of Object.entries({
      time: frame / fps,
      distortion,
      moire,
      vignette,
    }))
      gl.uniform1f(gl.getUniformLocation(program, key), value);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.finish();
    return () => {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [frame, fps, width, height, ready, distortion, moire, vignette]);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <canvas
        ref={canvas}
        width={width}
        height={height}
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  );
};
