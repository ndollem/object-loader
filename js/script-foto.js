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
    //define how often we will request for new data via ajax
    const fetchStep = 2;
    //define path for json data
    const url = 'data/paging-foto';
    

    initPage();

    function initPage()
    {
        document.getElementById("btnNext").addEventListener("click", loadNext);
    }

    function loadNext()
    {
        //get current paging number
        curPage = btnNext.getAttribute('data-part');
        curPaging = btnNext.getAttribute('data-paging');

        //creating new main container
        this.nextPage = parseInt(curPage)+1;
        this.newContainer = document.createElement('div');
        this.newContainer.setAttribute('class', 'screen-page');
        this.newContainer.setAttribute('id', pagingName+this.nextPage);
        //console.log('curPage '+curPage);
        //console.log('curPaging '+curPaging);
        //console.log('nextPage '+this.nextPage);

        //reading json template
        if(this.dt = formatData(curPage))
        {
            //console.log(this.dt);
            let tmpl = document.querySelector('#'+this.dt.templateName);
            
            //put template content to new container
            this.newContainer.appendChild(tmpl.content.cloneNode(true));

            //inserting new element to main document
            this.currentContainer = document.getElementById(pagingName+curPage);
            this.currentContainer.insertAdjacentElement("afterend", this.newContainer);

            //updateing button paging index
            this.setAttribute('data-part', this.nextPage);
            
            //add page with new content based on correct template
            vm = function(dt){
                //console.log(dt.viewModel);
                layoutViewModel = dt.viewModel;
                layoutScript = function(elements){
                    //put post render script here!
                };
            }
            //add custom binding specific for ads
            ko.bindingHandlers.adsCall = {
                init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                    // This will be called when the binding is first applied to an element
                    // Set up any initial state, event handlers, etc. here
                    showAds(viewModel.adsContainer, viewModel.adsSize, viewModel.adsUnit);
                }
            };

            ko.applyBindings(vm(this.dt), document.getElementById(pagingName+this.nextPage));

            //make scroll down to new element
            document.getElementById(pagingName+this.nextPage).scrollIntoView(true);

            //last action is to call fetch data on every fetchStep const
            if(this.nextPage % fetchStep == 0){
                //updating button paging index
                //console.log('fetching : '+curPaging);
                this.setAttribute('data-paging', parseInt(curPaging)+1);
                fetchData(curPaging);
            }

            //remove next button
            if(parseInt(curPage) >= window.pagingContent.rows.length)
                this.classList.add("d-none");
        
        }else{
            this.classList.add("d-none");
        }
    }

    function formatData(nextPage){
        //reduce index by 1 since array always start from 0
        nextPage--;
        
        if(this.rawdt = window.pagingContent.rows[nextPage])
        {
            //console.log(this.rawdt);
            this.dt = {};

            //preparing view models
            this.rawAttr = this.rawdt['attributes'];
            for (var key of Object.keys(this.rawAttr)) {
                //add additional value for ads
                if(this.rawAttr[key].type=='ads'){
                    this.dt["adsSize"] = this.rawAttr[key].size;
                    this.dt["adsUnit"] = this.rawAttr[key].adunit;
                }
                //toogle html tag visible of rendered
                if(this.rawAttr[key].type=='ads'){
                }
                this.dt[this.rawAttr[key].name] = this.rawAttr[key].value;
            }

            //console.log(this.dt);
            return {
                'templateName': this.rawdt['templateId'],
                'viewModel': this.dt
            };
        }else return false;
    }

    function fetchData(nextPage)
    {
        //console.log('call fetch '+nextPage);

        //fetch json data
        this.loadNext = collectData(url + nextPage + ".json")
            .then(response => {

                //merge new fetched data into initial paging data variable
                if(response){
                    for (var key of Object.keys(response.rows)) {
                        window.pagingContent.rows.push( new Object(response.rows[key]));
                    }
                }
            });
        
        
        //console.log(window.pagingContent);
    }

    async function collectData(url)
    {
        return fetch(url)
        .then( async (data) => {
            if (data.ok) {
                data = await data.json();
                
                return data;

            }else{
                // make the promise be rejected if we didn't get a 2xx response
                //throw new Error("Not 2xx response");  
                return false;              
            }
        }).catch(e => console.log('Connection error', e))
    }

}, document);