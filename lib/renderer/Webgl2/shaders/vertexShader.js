const vertexShaderSrc = 
`#version 300 es
precision mediump float;

in vec2 vert_pos;

in mat3 instance_mat;      // Transformation matrix
in mat3 instance_tex_mat;  // Texture matrix
in float instance_alpha;   // Alpha value
in vec3 instance_overlay;  // Overlay color

uniform mat3 u_mat;

out vec2 v_texCoord;
out float v_alpha;
out vec3 v_overlay;

void main() {
    // Apply global transformation and instance transformation
    mat3 final_mat = u_mat * instance_mat;
    vec3 pos = final_mat * vec3(vert_pos, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);  
    // Apply texture transformation
    v_texCoord = (instance_tex_mat * vec3(vert_pos, 1.0)).xy;

    // Pass through instance data
    v_alpha = instance_alpha;
    v_overlay = instance_overlay;
}

`


export default vertexShaderSrc