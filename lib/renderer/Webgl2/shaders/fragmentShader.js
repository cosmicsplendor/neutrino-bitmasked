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
    
    // Use step() to avoid branching
    float isOverlay = step(v_overlay.r, 1.9);  // 1 if overlay, 0 if not
    
    // Work directly with premultiplied values
    vec3 color = mix(tex_color.rgb * v_alpha, v_overlay * tex_color.a, isOverlay);
    float finalAlpha = mix(tex_color.a * v_alpha, tex_color.a, isOverlay);
    
    fragColor = vec4(color, finalAlpha);
}
`

export default fragShaderSrc