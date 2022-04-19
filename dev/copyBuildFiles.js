const { cp } = require( 'fs/promises' );

( async () => {
	await cp(
		'src/views',
		'dist/views',
		{
			recursive: true
		}
	);

	await cp(
		'src/assets',
		'dist/assets',
		{
			recursive: true
		}
	);
} )();

