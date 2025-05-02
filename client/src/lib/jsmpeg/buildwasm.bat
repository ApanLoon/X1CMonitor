
SET EMSCRIPTEN_LIB=%EMSDK%\fastcomp\emscripten\system\lib

emcc.bat ^
src\wasm\mpeg1.c ^
src\wasm\mp2.c ^
src\wasm\buffer.c ^
%EMSCRIPTEN_LIB%\emmalloc.cpp ^
%EMSCRIPTEN_LIB%\libc\musl\src\string\memcpy.c ^
%EMSCRIPTEN_LIB%\libc\musl\src\string\memmove.c ^
%EMSCRIPTEN_LIB%\libc\musl\src\string\memset.c ^
-s WASM=1 ^
-s SIDE_MODULE=2 ^
-s TOTAL_STACK=5242880 ^
-s USE_PTHREADS=0 ^
-s LEGALIZE_JS_FFI=0 ^
-s NO_FILESYSTEM=1 ^
-s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE="[]" ^
-s "EXPORTED_FUNCTIONS=[ '_memcpy','_memmove','_memset','_mpeg1_decoder_create','_mpeg1_decoder_destroy','_mpeg1_decoder_get_write_ptr','_mpeg1_decoder_get_index','_mpeg1_decoder_set_index','_mpeg1_decoder_did_write','_mpeg1_decoder_has_sequence_header','_mpeg1_decoder_get_frame_rate','_mpeg1_decoder_get_coded_size','_mpeg1_decoder_get_width','_mpeg1_decoder_get_height','_mpeg1_decoder_get_y_ptr','_mpeg1_decoder_get_cr_ptr','_mpeg1_decoder_get_cb_ptr','_mpeg1_decoder_decode','_mp2_decoder_create','_mp2_decoder_destroy','_mp2_decoder_get_write_ptr','_mp2_decoder_get_index','_mp2_decoder_set_index','_mp2_decoder_did_write','_mp2_decoder_get_left_channel_ptr','_mp2_decoder_get_right_channel_ptr','_mp2_decoder_get_sample_rate','_mp2_decoder_decode']" ^
-O3 ^
-o jsmpeg.wasm
