import { ParticleKind, PlayTheme } from '../../content/themes';

interface Particle {
  x: number; y: number; velocityX: number; velocityY: number; size: number; rotation: number;
  spin: number; age: number; life: number; colour: string; kind: ParticleKind;
  letter?: string;
}

export class ParticleEngine {
  private readonly particles: Particle[] = [];
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private frameId?: number;
  private previousTime = 0;
  private reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.context = canvas.getContext('2d') ?? undefined;
    this.resize();
  }

  resize(): void {
    if (!this.canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.canvas.clientWidth * ratio);
    this.canvas.height = Math.round(this.canvas.clientHeight * ratio);
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  setReducedMotion(enabled: boolean): void { this.reducedMotion = enabled; }

  burst(x: number, y: number, theme: PlayTheme, amount = this.reducedMotion ? 4 : 11): void {
    this.addParticles(x, y, theme, amount, 1);
  }

  trail(x: number, y: number, theme: PlayTheme): void { this.addParticles(x, y, theme, this.reducedMotion ? 1 : 2, 0.45); }

  popLetter(letter: string, x: number, y: number, theme: PlayTheme): void {
    if (this.particles.length >= 180) return;
    const colour = theme.colours[Math.floor(Math.random() * theme.colours.length)];
    this.particles.push({
      x, y, velocityX: (Math.random() - 0.5) * 1.4, velocityY: -2.4, size: this.reducedMotion ? 38 : 48,
      rotation: (Math.random() - 0.5) * 0.24, spin: (Math.random() - 0.5) * 0.025,
      age: 0, life: this.reducedMotion ? 520 : 980, colour, kind: 'circle', letter: letter.toUpperCase()
    });
    if (!this.frameId) this.frameId = requestAnimationFrame((time) => this.tick(time));
  }

  dispose(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = undefined;
    this.particles.length = 0;
    this.context?.clearRect(0, 0, this.canvas?.clientWidth ?? 0, this.canvas?.clientHeight ?? 0);
  }

  private addParticles(x: number, y: number, theme: PlayTheme, amount: number, energy: number): void {
    const available = Math.max(0, 180 - this.particles.length);
    for (let index = 0; index < Math.min(amount, available); index++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.7 + Math.random() * 2.3) * energy;
      this.particles.push({ x, y, velocityX: Math.cos(angle) * speed, velocityY: Math.sin(angle) * speed - 0.8,
        size: 7 + Math.random() * 15, rotation: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.16,
        age: 0, life: this.reducedMotion ? 340 : 620 + Math.random() * 400,
        colour: theme.colours[Math.floor(Math.random() * theme.colours.length)],
        kind: theme.particles[Math.floor(Math.random() * theme.particles.length)] });
    }
    if (!this.frameId) this.frameId = requestAnimationFrame((time) => this.tick(time));
  }

  private tick(time: number): void {
    const elapsed = Math.min(32, time - (this.previousTime || time));
    this.previousTime = time;
    this.frameId = undefined;
    this.draw(elapsed);
    if (this.particles.length) this.frameId = requestAnimationFrame((next) => this.tick(next));
  }

  private draw(elapsed: number): void {
    if (!this.context || !this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.context.clearRect(0, 0, width, height);
    for (let index = this.particles.length - 1; index >= 0; index--) {
      const particle = this.particles[index];
      particle.age += elapsed;
      if (particle.age >= particle.life) { this.particles.splice(index, 1); continue; }
      particle.x += particle.velocityX * elapsed / 16;
      particle.y += particle.velocityY * elapsed / 16;
      particle.velocityY += 0.035 * elapsed / 16;
      particle.rotation += particle.spin * elapsed / 16;
      const opacity = Math.pow(1 - particle.age / particle.life, 1.35);
      this.paint(particle, opacity);
    }
  }

  private paint(particle: Particle, opacity: number): void {
    const context = this.context!;
    context.save();
    context.translate(particle.x, particle.y);
    context.rotate(particle.rotation);
    context.globalAlpha = opacity;
    context.fillStyle = particle.colour;
    if (particle.letter) {
      this.paintMagnetLetter(particle);
      context.restore();
      return;
    }
    if (particle.kind === 'circle' || particle.kind === 'bubble') {
      context.beginPath(); context.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
      if (particle.kind === 'bubble') { context.lineWidth = 3; context.strokeStyle = particle.colour; context.stroke(); } else context.fill();
    } else if (particle.kind === 'star') {
      context.beginPath();
      for (let point = 0; point < 10; point++) {
        const radius = point % 2 === 0 ? particle.size / 2 : particle.size / 4;
        const angle = point * Math.PI / 5 - Math.PI / 2;
        point ? context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius) : context.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      context.closePath(); context.fill();
    } else {
      context.fillRect(-particle.size / 8, -particle.size / 2, particle.size / 4, particle.size);
      context.fillRect(-particle.size / 2, -particle.size / 8, particle.size, particle.size / 4);
    }
    context.restore();
  }

  private paintMagnetLetter(particle: Particle): void {
    const context = this.context!;
    const fontSize = particle.size;
    context.font = `900 ${fontSize}px "Arial Rounded MT Bold", "Comic Sans MS", system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.lineWidth = Math.max(4, fontSize * 0.13);
    context.strokeStyle = '#ffffff';
    context.strokeText(particle.letter!, 0, 0);
    context.fillStyle = particle.colour;
    context.fillText(particle.letter!, 0, 0);
    context.globalAlpha *= 0.2;
    context.lineWidth = 1.5;
    context.strokeStyle = '#5b2c3c';
    context.strokeText(particle.letter!, 1.2, 1.6);
  }
}
