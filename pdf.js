/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

const createIframe = (bus, proc, win, cb) => {
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.setAttribute('border', '0');
  iframe.style.backgroundColor= 'white';
  iframe.addEventListener('load', () => {
    const ref = iframe.contentWindow;

    // This will proxy the window focus events to iframe
    win.on('focus', () => ref.focus());
    win.on('blur', () => ref.blur());
	if (window.mobile === true)
		win.maximize();
    // Create message sending wrapper
    const sendMessage = msg => ref.postMessage(msg, window.location.href);

    // After connection is established, this handler will process
    // all events coming from iframe.
    proc.on('message', data => {
      console.warn('[Application', 'Iframe sent', data);
      bus.emit(data.method, sendMessage, ...data.args);
    });

    cb(sendMessage);
  });

  return iframe;
};

// Creates the internal callback function when OS.js launches an application
// Note the first argument is the 'name' taken from your metadata.json file
OSjs.make('osjs/packages').register('PDFViewer', (core, args, options, metadata) => {

  // Create a new Application instance
  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  // Create  a new Window instance
  proc.createWindow({
    id: 'MyIframeApplicationWindow',
    title: metadata.title.en_EN,
    dimension: {width: 530, height:600},

    position: {left: 720, top: 32}
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => {
    	const suffix = `?pid=${proc.pid}&wid=${win.wid}`; 
      // Create a new bus for our messaging
      if (window.mobile === true)
		win.maximize();
      const bus = core.make('osjs/event-handler', 'MyIframeApplicationWindow');

      // Get path to iframe content
 //    const src = proc.resource('/data/pdf.js/web/index.html');
     let src = proc.resource('/data/pdf.js/new-web/new-viewer.html' + suffix + '&file=vfs/' + core.getUser().username + "/");
 
      // Create DOM element
      const iframe = createIframe(bus, proc, win, send => {
//{file: {path: 'home://Sheep-May-Safely-Graze/Sheep.ly'}}

      	if (proc.args.file) {
      		const user= core.getUser();
      		proc.args.username= user.username;
         	send({
         	 	method: 'pdf',
          		args: proc.args.file
     	   });
 
      	}
/*
		else  {
			iframe.src = proc.resource('/data/pdf.js/new-web/new-viewer.html?file=Cover.pdf')

		}
*/
   		proc.on('attention', (newargs) => {
   			const user= core.getUser();
//  iframe.src = src + proc.args.path.replace(/^home:\//, ''); 			
			win.focus();
//			iframe.src = src + newargs.path.replace(/^home:\//, '') + newargs.zoomString + "?" + Date.now();
			iframe.src = src + newargs.file.path.replace(/^home:\//, '');
//			iframe.src = iframe.src + newargs.zoomString;
// http://localhost:8888/apps/PDFViewer/data/pdf.js/new-web/new-viewer.html?file=vfs/demo/Rondo.pdf
// http://localhost:8888/apps/PDFViewer/data/pdf.js/new-web/new-viewer.html?file=vfs/demo/Rondo.pdf?1586138984003#page-width

			if (newargs.file) {
				newargs.username = user.username;
        	send({
         	 	method: 'pdf',
          		args: newargs
        	});
      		}	
   		});
 
   		win.on('drop', (ev, options) => {
   			const user= core.getUser();
   			
			win.focus();
			iframe.src = src + options.filename;

   		}); 
 
win.on('iframe:get', msg => {

//this removes leading user directory
var splitArray= msg.split("/");
var str='';
for (var i=1; i < splitArray.length; i++)	{
	str= str + "/" + splitArray[i];
}


core.broadcast('Editor', 'placeCursor', str, false);


 	
});   

 
 // Send the process ID to our iframe to establish communication
        
        send({
          method: 'init',
          
          args: [proc.pid]
        });
      });


      // Finally set the source and attach
 
 //     proc.args.path= proc.args.path.replace('.ly', '.pdf');
 //	  proc.args.filename= proc.args.filename.replace('.ly', '.pdf');

      
//      if (proc.args.file.zoomString)
//	     iframe.src = src + proc.args.file.path.replace(/^home:\//, '');
//	  else
//	   		iframe.src = src + proc.args.file.path.replace(/^home:\//, '');
	   		
      // Attach
      $content.appendChild(iframe);
      
    });

  return proc;
});
