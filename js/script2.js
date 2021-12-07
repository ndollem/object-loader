(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);


docReady(function(doc) {
    //define view model
    var vm = [];
    //define name of page container
    const pagingName = "screen";
    //define button next to load data
    const btnNext = document.getElementById("btnNext");
    //get current paging number
    var curPage = btnNext.getAttribute('data-part');
    

        

    initPage();

    function initPage()
    {
        //preparing view models
        for (var key of Object.keys(window.pagingContent)) {
            console.log(key + " -> " + window.pagingContent[key]);
            
        }
    }

    
    vm[curPage] = function(){
        this.imgUrl = ko.observable("https://www.cssscript.com/demo/pure-css-parallax-background-images/img/gCanyon.jpg");
        this.content = 'lorem ipsum';
    }
    
    ko.applyBindings(vm[curPage], document.getElementById(pagingName+curPage));

    document.getElementById("btnNext").addEventListener("click", loadNext);

    function loadNext()
    {
        //get current paging number
        curPage = btnNext.getAttribute('data-part');


        //reading template
        let tmpl = document.querySelector('#layout1');
        
        //creating new main container
        this.nextPage = parseInt(curPage)+1;
        this.newContainer = document.createElement('div');
        this.newContainer.setAttribute('class', 'screen-page');
        this.newContainer.setAttribute('id', pagingName+this.nextPage);

        //put template content to new container
        this.newContainer.appendChild(tmpl.content.cloneNode(true));

        //inserting new element to main document
        this.currentContainer = document.getElementById(pagingName+curPage);
        this.currentContainer.insertAdjacentElement("afterend", this.newContainer);

        //updateing button paging index
        this.setAttribute('data-part', this.nextPage);

        vm[curPage] = function(){
            this.imgUrl = ko.observable("https://www.cssscript.com/demo/pure-css-parallax-background-images/img/rMountains.jpg");
            this.content = 'lorem ipsum';
        }
        ko.applyBindings(vm[curPage], document.getElementById(pagingName+this.nextPage));
    }
}, document);