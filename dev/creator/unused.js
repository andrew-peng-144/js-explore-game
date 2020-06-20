    // function downloadDAT() {
    //     console.log("wo");
    //     var textFile = null,
    //         makeDAT = function (arr) {
    //             var data = new Blob(arr, { type: 'text/plain' });
    //             //TODO problem with using ansi: 0 converts to '0' but 1 and all else correctly converts to its true ascii value (1 = SOH)
    //             //Side effect: There's no difference b/t id 0 and id 48.
    //             //Ez way to circumvent is to just not use id 48 lol...

    //             // If we are replacing a previously generated file we need to
    //             // manually revoke the object URL to avoid memory leaks.
    //             if (textFile !== null) {
    //                 window.URL.revokeObjectURL(textFile);
    //             }

    //             textFile = window.URL.createObjectURL(data);

    //             // returns a URL you can use as a href
    //             //TODO write the width of the text file as the first line, then all data on second.
    //             return textFile;
    //         };

    //     var link = document.createElement('a');
    //     link.setAttribute('download', 'testworld.txt');
    //     console.log("wo2");
    //     link.href = makeDAT(GLOBAL.drawBuffer);
    //     console.log("wo3");
    //     document.body.appendChild(link);
    //     // wait for the link to be added to the document
    //     window.requestAnimationFrame(function () {
    //         var event = new MouseEvent('click');
    //         link.dispatchEvent(event);
    //         document.body.removeChild(link);
    //     });
    // }

    
    /**
     * updates the output area AND copies to clipboard
     * @param {String} str 
     */
    // function copyStringToClipboard(str) {
    //     var copyText = document.getElementById("clipboard");
    //     copyText.value = str;
    //     /* Select the text field */
    //     copyText.select();

    //     copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    //     /* Copy the text inside the text field */
    //     document.execCommand("copy");
    //     alert("Copied the text: " + copyText.value);
    // }

        // //more jQuery events
    // var cti_i = $("#coords-to-id input[type='number']");
    // //$('#coords-to-id-submit').click(
    // cti_i.change(
    //     function (e) {
    //         $('#coords-to-id-result').text("" + coordsToID(
    //             parseInt(cti_i.get(0).value),
    //             parseInt(cti_i.get(1).value)
    //         ))
    //     }
    // );