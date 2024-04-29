import {
	Canvas,
	Fill,
	Shader,
	SkRuntimeEffect,
	Skia,
	useClock,
	useTouchHandler,
	vec,
} from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

const source = Skia.RuntimeEffect.Make(`
// UIniforms passed in via the uniforms prop on <Shader />
// Array of 4 float4 (numbers)
uniform float4 colors[4];
// Vector with the center of the screen
uniform float2 center;
// Vector with the current position of the pointer (touch event)
uniform float2 pointer;
// Rolling clock value in milliseconds
uniform float clock;

struct Paint {
  float4 color;
  bool stroke;
  float strokeWidth;
};

const float4 black = vec4(0, 0, 0, 1);

float sdCircle(vec2 xy, float radius) {
  return length(xy) - radius;
}

float sdLine(vec2 p, vec2 a, vec2 b) {
  // "p" is the current xy pixel
  // "a" and "b" are the 2 points we want to draw between or
  // get the SDF result of.
  // In our case, remember that  "p" can be _any_ pixel on the screen
  // so whilst A and B remain constant as the two points of our line,
  // P can be the value of any pixel.
  vec2 pa = p - a;
  vec2 ba = b - a;

  float h = saturate(
    dot(pa, ba) / dot(ba, ba)
  );

  return length(pa - ba * h);
}

float4 draw(float4 color, float d, Paint paint) {
  // Accept "d" as the distance. This will be the result of any Signed
  // Distance Function, meaning this function can be applied to any
  // shape to draw it.

  // A negative value for d means our "d" value is inside the circle
  // and vice-versa for a positive "d" value.

  // If we want to draw a stroke then we take "abs(d)" to account for the
  // negative values where we are inside the circle.

  // We use "strokeWidth / 2" to paint the stroke when we are within 10
  // of the outside of the circle and 10 on the inside of the circle.

  // We could also use the fact that "d" is +ve or -ve on the inside or
  // outside of the circle to do something different, but this is the
  // usual way a stroke behaves.
  bool isFill = paint.stroke == false && d < 0;
  bool isStroke = paint.stroke == true && abs(d) <= paint.strokeWidth / 2;

  if (isFill || isStroke) {
    return paint.color;
  }

  return color;
}

float4 drawCircle(float4 color, float2 pos, float radius, Paint paint) {
  // Define the distance from the circle using a Signed Distance
  // Function
  float d = sdCircle(pos, radius);

  return draw(color, d, paint);
}

float4 drawLine(float4 color, float2 pos, float2 a, float2 b, Paint paint) {
  float d = sdLine(pos, a, b);

  return draw(color, d, paint);
}

// main function to take in X and Y and return a colour to
// draw each pixel in
vec4 main(vec2 xy) {
  // Define a stroke to add to the edge of the circle
  float strokeWidth = 20;

  // Define our circle's radius using the center
  // We are passing in "width / 2" as the X coordinate so
  // simply using "center.x" as the circle's radius will
  // result in a circle that takes up the full width of
  // the page

  // Add "strokeWidth / 2" to reduce the circle's width using
  // the strokeWidth. Use "/ 2" because the stroke usually
  // gets applied half inside and half outside the circle.
  float radius = center.x - strokeWidth / 2;

  float4 color = colors[1];

  // Gets the SDF value from the line for the current xy position
  // using the center (A) and the pointer (B) as the two points on
  // the line
  float d = sdLine(xy, center, pointer);

  // Creates a number that keeps getting updated. "Clock" will be
  // a rolling time in milliseconds
  float offset = -clock * 0.03;

  // "X / strokeWidth" will give us an interval based on the stroke width
  // modding that by 4 will put all interval values into 0-4 values so
  // that we can paint a colour based on the xy position.
  float interval = mod(
    floor((d + offset) / strokeWidth),
    4
  );

  if (interval == 0) {
    color = colors[0];
  } else if (interval == 1) {
    color = colors[1];
  } else if (interval == 2) {
    color = colors[2];
  } else if (interval == 3) {
    color = colors[3];
  }

  return color;
}
`);

const colors = ['#dafb61', '#61DAFB', '#fb61da', '#61fbcf'].map(c =>
	Skia.Color(c),
);

export function SdfLine() {
	const { width, height } = useWindowDimensions();
	// "useClock" provides a value in ms since the hook started
	// Essentially gives us a dynamic, updating number that we can
	// use to perform animations
	const clock = useClock();
	// Creates a vector (coord) at the center of the canvas
	// where the X would be halfway along the width of the window
	// and the Y would be the same for the height
	const center = vec(width / 2, height / 2);

	const pointer = useSharedValue(vec(0, 0));

	const onTouch = useTouchHandler({
		onActive: e => {
			pointer.value = e;
		},
	});

	const uniforms = useDerivedValue(
		() => ({
			colors,
			center,
			pointer: pointer.value,
			clock: clock.value,
		}),
		[pointer, clock],
	);

	return (
		<Canvas style={{ flex: 1 }} onTouch={onTouch}>
			<Fill>
				<Shader source={source as SkRuntimeEffect} uniforms={uniforms} />
			</Fill>
		</Canvas>
	);
}
