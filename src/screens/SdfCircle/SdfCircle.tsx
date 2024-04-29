import {
	Canvas,
	Fill,
	Shader,
	SkRuntimeEffect,
	Skia,
	useTouchHandler,
	vec,
} from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

const source = Skia.RuntimeEffect.Make(`
// UIniforms passed in via the uniforms prop on <Shader />
// Array of 4 float4 (numbers)
uniform float4 colors[4];

// Vector with the center
uniform float2 center;

uniform float2 pointer;

struct Paint {
  float4 color;
  bool stroke;
  float strokeWidth;
};

const float4 black = vec4(0, 0, 0, 1);

float sdCircle(vec2 xy, float radius) {
  return length(xy) - radius;
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

  // Without adding "- center" the origin vector would
  // be used to draw the circle
  color = drawCircle(
    color,
    xy - center,
    radius,
    Paint(colors[2], true, 20)
  );

  color = drawCircle(
    color,
    xy - pointer,
    10,
    Paint(black, false, 0)
  );

  // Uses an SDF to show the "d" value of the pointer relative
  // to the big magenta circle.
  // We'll make the circle bigger as you move the pointer further
  // away from the circle. So here we will get the SDF value using
  // the two vectors "pointer - center" and "radius", which will
  // give us the distance between the pointer and the circle.
  float d = sdCircle(pointer - center, radius);

  color = drawCircle(
    color,
    xy - pointer,
    // radius value
    // Using absolute to also visualise the SDF result whilst inside
    // the circle.
    abs(d),
    Paint(black, true, 3)
  );

  return color;
}
`);

const colors = ['#dafb61', '#61DAFB', '#fb61da', '#61fbcf'].map(c =>
	Skia.Color(c),
);

export function SdfCircle() {
	const { width, height } = useWindowDimensions();
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
		}),
		[pointer],
	);

	return (
		<Canvas style={{ flex: 1 }} onTouch={onTouch}>
			<Fill>
				<Shader source={source as SkRuntimeEffect} uniforms={uniforms} />
			</Fill>
		</Canvas>
	);
}
