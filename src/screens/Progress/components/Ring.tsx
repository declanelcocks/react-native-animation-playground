import {
  Circle,
  Fill,
  Group,
  Path,
  PathOp,
  Shader,
  Skia,
  SkPoint,
  SweepGradient,
  Vector,
} from '@shopify/react-native-skia';
import { PropsWithChildren, useEffect, useMemo } from 'react';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  readonly center: SkPoint;
  readonly ring: RingProperty;
  readonly strokeWidth: number;
};

type RingProperty = {
  background: string;
  colors: string[];
  size: number;
  totalProgress: number;
};

const glsl = (source: TemplateStringsArray, ...values: (number | string)[]) => {
  const processed = source
    .flatMap((s, index) => [s, values[index]])
    .filter(Boolean);
  return processed.join('');
};

const frag = (source: TemplateStringsArray, ...values: (number | string)[]) => {
  const code = glsl(source, ...values);
  const rt = Skia.RuntimeEffect.Make(code);
  if (rt === null) {
    throw new Error('error');
  }
  return rt;
};

const source = frag`
uniform shader image;
uniform vec2 head;
uniform float progress;
uniform vec4 color;
uniform float r;

vec2 rotate(in vec2 coord, in float angle, vec2 origin) {
  vec2 coord1 = coord - origin;
  vec2 rotated = coord1 * mat2( cos(angle), -sin(angle),
                       sin(angle),  cos(angle));
  return rotated + origin;
 }

vec4 main(vec2 xy) {
  float d = distance(xy, head);

  vec2 rotated = rotate(xy, ${-Math.PI} - progress * ${2 * Math.PI}, head);

  if (rotated.y > head.y) {
    return vec4(0, 0, 0, 0);
  }

  if (d > r) {
    return vec4(0, 0, 0, smoothstep(35, 0, d));
  }

  if (progress > 1) {
    return color;
  }

  return image.eval(head);
}
`;

const fromCircle = (center: Vector, r: number) => {
  'worklet';

  return Skia.XYWHRect(center.x - r, center.y - r, r * 2, r * 2);
};

export function Ring({ center, ring, strokeWidth }: PropsWithChildren<Props>) {
  const trim = useSharedValue(0);
  const circleRadius = ring.size / 2 - strokeWidth / 2;

  const clip = useMemo(() => {
    const outerCircle = Skia.Path.Make();
    outerCircle.addCircle(center.x, center.y, ring.size / 2);

    const innerCircle = Skia.Path.Make();
    innerCircle.addCircle(center.x, center.y, ring.size / 2 - strokeWidth);

    return Skia.Path.MakeFromOp(outerCircle, innerCircle, PathOp.Difference);
  }, [center.x, center.y, ring.size, strokeWidth]);

  const fullPath = useMemo(() => {
    const path = Skia.Path.Make();
    const fullRevolutions = Math.floor(ring.totalProgress);

    for (let index = 0; index < fullRevolutions; index += 1) {
      path.addCircle(center.x, center.y, circleRadius);
    }

    path.addArc(
      fromCircle(center, circleRadius),
      0,
      360 * (ring.totalProgress % 1),
    );

    return path;
  }, [center, circleRadius, ring.totalProgress]);

  const path = useDerivedValue(() => {
    if (trim.value < 1) {
      return fullPath.copy().trim(0, trim.value, false);
    }

    return fullPath;
  });

  const matrix = useDerivedValue(() => {
    const m = Skia.Matrix();
    const progress = trim.value * ring.totalProgress;
    const angle = progress < 1 ? 0 : (progress % 1) * 2 * Math.PI;

    if (angle > 0) {
      m.translate(center.x, center.y);
      m.rotate(angle);
      m.translate(-center.x, -center.y);
    }

    return m;
  });

  const uniforms = useDerivedValue(() => {
    return {
      color: [...Skia.Color(ring.colors[1])],
      head: path.value?.getLastPt(),
      progress: trim.value * ring.totalProgress,
      r: strokeWidth / 2,
    };
  });

  useEffect(() => {
    trim.value = withTiming(1, { duration: 3000 });
  }, [trim]);

  return (
    <Group origin={center} transform={[{ rotate: -Math.PI / 2 }]}>
      <Group clip={clip as any}>
        <Fill color={ring.background} />

        <Circle
          c={fullPath.getPoint(0)}
          color={ring.colors[0]}
          r={strokeWidth / 2}
        />

        <Path
          color={ring.colors[0]}
          path={path as any}
          strokeWidth={strokeWidth}
          style="stroke"
        >
          <SweepGradient c={center} colors={ring.colors} matrix={matrix} />
        </Path>

        <Fill>
          <Shader source={source} uniforms={uniforms as any}>
            <SweepGradient c={center} colors={ring.colors} matrix={matrix} />
          </Shader>
        </Fill>
      </Group>
    </Group>
  );
}
