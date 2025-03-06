const fragShaderSrc = 
`#version 300 es
precision highp float;

in vec2 v_texCoord;
in float v_alpha;
in vec4 v_debug;
in vec3 v_overlay;

uniform sampler2D tex_unit;

out vec4 fragColor;

void main() {
    vec4 tex_color = texture(tex_unit, v_texCoord);
    
    if (v_overlay.r == 2.0) {
        // No overlay - just use texture color with instance alpha
        fragColor = vec4(tex_color.rgb, tex_color.a * v_alpha);
    } else {
        // Apply overlay while preserving texture alpha
        // Since input is premultiplied, un-premultiply first
        float alpha = tex_color.a;
        vec3 unpremult = alpha > 0.0 ? tex_color.rgb / alpha : tex_color.rgb;
        // Apply overlay to unpremultiplied color
        vec3 overlaid = v_overlay.rgb;
        // Premultiply result
        fragColor = vec4(overlaid * alpha, alpha);
    }
}
`

export default fragShaderSrc