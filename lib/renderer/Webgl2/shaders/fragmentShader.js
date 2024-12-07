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
    
    // Apply overlay if it exists (non-zero)
    vec3 finalColor = v_overlay.r == 2.0 ? tex_color.rgb : v_overlay;
    
    // Set final color with alpha
    fragColor = vec4(finalColor, tex_color.a * v_alpha);
}
`


export default fragShaderSrc