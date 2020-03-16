const ytlist = require( 'youtube-playlist' );
const ytdl = require( 'youtube-dl' );
const path = require( 'path' );
const fs = require( 'fs' );
const mkdirp = require( 'mkdirp' );
const ASCIIFolder = require( 'fold-to-ascii' );


const url = 'INSERT FULL PLAYLIST URL HERE';
const maxParallelDownloads = 20; // Maximum amount of parallel downloads at once
let outputPath = 'download'; // Download folder
let isOutputRelative = true; // If output path is absolute or relative to cwd



if (isOutputRelative) {
	outputPath = path.join( process.cwd(), outputPath );
}

const fileNameFilter = /\/|\\|\?|%|\*|:|\||"|<|>|\./g;

( async () => {
    try {
        let playlist = ( await ytlist( url, [ 'name', 'url' ] ) ).data.playlist;
        let remaining = playlist.length;
        let downloading = 0, index = 0;
        await mkdirp( outputPath );
        while ( index < playlist.length ) {
            if ( downloading < maxParallelDownloads ) {
                downloading ++;
                let video = playlist[ index++ ];
                let dl = ytdl( video.url, [ '--format=18' ] );
                video.name = ASCIIFolder.foldReplacing( video.name ).replace(fileNameFilter, '').trim();
                console.log( 'Downloading ' + video.name );
                dl.pipe( fs.createWriteStream( path.join( outputPath, ASCIIFolder.foldReplacing( video.name ) + '.mp4' ) ) );
                dl.on( 'end', () => {
                    console.log( 'Finished downloading ' + video.name );
                    console.log( --remaining + ' videos remaining' );
                    downloading--;
                } );
            } else {
                await sleep(1000);
            }
        }
    } catch ( e ) {
        console.error( e );
    }
} )();

function sleep( ms ) {
    return new Promise( ( resolve ) => {
        setTimeout( resolve, ms );
    } );
}  