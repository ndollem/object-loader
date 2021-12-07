class BtnNext extends HTMLElement {
    constructor() {
        super();
        this.url = 'data/paging';
        //this.initialData = window.pagingContent;
        //console.log(this.initialData);

        // Setup a click listener on <app-drawer> itself.
        this.addEventListener('click', e => {
            // Don't toggle the drawer if it's disabled.
            if (this.disabled) {
                return;
            }
        this.callNext();
      });
    }

    // A getter/setter for a disabled property.
    get disabled() {
        return this.hasAttribute('disabled');
    }

    set disabled(val) {
        // Reflect the value of the disabled property as an HTML attribute.
        if (val) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }

    connectedCallback() {
        this.innerHTML = "<i class='bi bi-chevron-double-down'></i>";
    }

    callNext()
    {
        //get current paging number
        this.page = this.getAttribute('data-part');
        console.log(this.page);

        //fetch json data
        this.loadNext = this.collectData(this.url + this.page + ".json")
            .then(response => {

                //merge new fetched data into initial paging data variable
                for (var key of Object.keys(response.rows)) {
                    window.pagingContent.rows.push( new Object(response.rows[key]));
                }

            });

        console.log(window.pagingContent.rows);

        this.updatingContent(window.pagingContent.rows[this.page]);
    }

    async collectData(url)
    {
        return fetch(url)
        .then( async (data) => {
            if (data.ok) {
                data = await data.json();
                
                return data;

            }else{
                //disabling button
                this.disabled = true;

                // make the promise be rejected if we didn't get a 2xx response
                throw new Error("Not 2xx response");  
                return false;              
            }
        }).catch(e => console.log('Connection error', e))
    }

    /**
     * append template object to next container
     */
    updatingContent(data)
    {
            console.log(data);

            //reading template
            let tmpl = document.querySelector('#layout1');
            
            //mapping data value to template base
            this.currentContent = this.mappingTemplate(tmpl, data);
            
            //creating new main container
            this.nextPage = parseInt(this.page)+1;
            this.newContainer = document.createElement('div');
            this.newContainer.setAttribute('class', 'screen-page');
            this.newContainer.setAttribute('id', 'main'+this.nextPage);

            //put template content to new container
            this.newContainer.appendChild(tmpl.content.cloneNode(true));

            //inserting new element to main document
            this.currentContainer = document.getElementById("main"+this.page);
            this.currentContainer.insertAdjacentElement("afterend", this.newContainer);

            //updateing button paging index
            this.setAttribute('data-part', parseInt(this.page)+1);
    }

    mappingTemplate(tmpl, dataRows)
    {
        for (var key of Object.keys(dataRows)) {
            console.log(key + " -> " + dataRows[key]);
            
        }
    }

}

window.customElements.define('btn-next', BtnNext);