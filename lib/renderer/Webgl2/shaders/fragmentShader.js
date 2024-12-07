const fragShaderSrc = 
`#version 300 es
precision highp float;

in vec2 v_texCoord;
in float v_alpha;
in vec4 v_debug;

uniform vec3 u_tint;
uniform sampler2D tex_unit;
uniform vec3 overlay;
uniform int use_overlay;

out vec4 fragColor;

void main() {
    vec4 tex_color = texture(tex_unit, v_texCoord);
    
    // Apply tint
    vec3 tinted_color = tex_color.xyz + u_tint;
    
    // Apply overlay
    vec3 finalColor = use_overlay == 0 ? tinted_color: overlay;
    
    // Set final color with alpha
    fragColor = vec4(finalColor, tex_color.a * v_alpha);
}
`


export default fragShaderSrc