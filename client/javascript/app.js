///////////////////////////////////////////////////////////////////////////////////
// DROPDOWN WEBCOMPONENT FOR TOWN SELECTION 
///////////////////////////////////////////////////////////////////////////////////
class dropdownSelection extends HTMLElement {
    constructor() {
        super();
    }

    // method that gets called when the element is attached to the DOM
    connectedCallback() {
        this.render();
        this.selections();
    }

    // sets the inner html of the custom element
    render() {
        this.innerHTML = `
            <label for="town">Select a Town:</label>
            <select id="town"></select>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <label for="filterBy">Select a Filter Type:</label>
            <select id="filterBy"></select>
            
            <button id="submitSelectionButton">Submit</button>
        `;

        // add event listener to the submit button which calls the method when clicked
        this.querySelector('#submitSelectionButton').addEventListener('click', () => {
            this.submitSelection();
        });
    }

    // calls fetch town and fetch filter methods
    selections() {
        this.fetchTowns();
        this.fetchFitlers();

        // creating a new instance of the price card
        this.hdbPriceCardsInstance = document.createElement('hdb-price-card');
        document.body.appendChild(this.hdbPriceCardsInstance);
    }

    async fetchTowns() {
        try {
            // fetches the towns from the API and stores it in a new list
            const response = await fetch(`http://localhost:8081/allhdbdata`);
            const townList = await response.json();
            const newTownList = [...new Set(townList.map(item => item.town))];

            const townDropdownList = this.querySelector('#town');
            const selectedTown = localStorage.getItem('selectedTown');

            townDropdownList.innerHTML = '';

            // adding the different towns to the dropdown list
            newTownList.forEach((town) => {
                const option = document.createElement('option');
                option.text = town;
                townDropdownList.add(option);

                if (town === selectedTown) {
                    option.selected = true;
                }
            });

            // creates a default option for the dropdown list
            const defaultOption = document.createElement('option');
            defaultOption.text = 'Select a town';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            townDropdownList.add(defaultOption);


        } catch (error) {
            console.error('Error fetching HDB towns in dropdown:', error);
        }
    }

    // retrieves the selected filter type from the dropdown list
    async fetchFitlers() {
        try {
            const filterDropdownList = this.querySelector('#filterBy');

            // adding a default option for the dropdown list
            const defaultOption = document.createElement('option');
            defaultOption.text = 'Select a filter type';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            filterDropdownList.add(defaultOption);

            // adding the different filter types to the dropdown list
            const filterTypes = [
                { value: 'HLP', text: 'Highest and Lowest Price' },
                { value: 'MMP', text: 'Mean and Median Price' },
                { value: 'BOTA', text: 'Both of the Above' }
            ];

            // outputting the filter types to the dropdown list
            filterTypes.forEach((filter) => {
                const filterOption = document.createElement('option');
                filterOption.value = filter.value;
                filterOption.text = filter.text;
                filterDropdownList.add(filterOption);
            });

        } catch (error) {
            console.error(`Error in fetching filter by type: ${error}`);
        }
    }

    // method to submit the selection of the town and filter type and get the input from user 
    submitSelection() {
        const townDropdownList = this.querySelector('#town');
        const filterDropdownList = this.querySelector('#filterBy');

        const selectedTown = townDropdownList.value;
        const selectedFilter = filterDropdownList.value;

        // displaying alert messages
        if (!selectedTown || selectedTown === 'Select a town') {
            alert(`Please select a town. Thank you.`);
            location.reload();
        } else if (!selectedFilter || selectedFilter === 'Select a filter type') {
            alert(`Please select a filter type. Thank you.`);
            location.reload();
        } else if(selectedTown === 'Select a town' && selectedFilter === 'Select a filter type') {
            alert(`Please select a town and filter type. Thank you.`);
            location.reload();
        }

        localStorage.setItem('selectedTown', selectedTown);
        localStorage.setItem('selectedFilter', selectedFilter);

        console.log(`Selected Town: ${selectedTown}`);
        console.log(`Selected Filter Type: ${selectedFilter}`);

        // clears the current existing card content
        this.hdbPriceCardsInstance.innerHTML = '';

        // used to display the price cards
        this.hdbPriceCardsInstance.displayPrice();
    }
}


///////////////////////////////////////////////////////////////////////////////////
// WEB COMPONENT USED TO DISPLAY THE PRICE CARDS AND UPDATE ATTRIBUTES
///////////////////////////////////////////////////////////////////////////////////
class priceCard extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'closed' });

        const template = document.createElement('template');
        template.innerHTML = `
            <div>
                <h3 id='flat_type'></h3>        
                <hr>
                <h5 id='highestPriceLabel'>Highest Price: $<span id='highestprice'></span></h5>
                <h5 id='lowestPriceLabel'>Lowest Price: $<span id='lowestprice'></span></h5>
                <h5 id='meanPriceLabel'>Mean Price: $<span id='meanprice'></span></h5>
                <h5 id='medianPriceLabel'>Median Price: $<span id='medianprice'></span></h5>
            </div>
        `;

        let clone = template.content.cloneNode(true);
        this.root.append(clone);
    }

    // adding a method to set the flat type
    setFlatType(flatType) {
        const element = this.root.querySelector('#flat_type');
        if (element) {
            element.textContent = flatType;
        } else {
            console.error('Element with ID "flat_type" not found.');
        }
    }

    // checks if there are any changes made to attributes
    static get observedAttributes() {
        return ['flat_type', 'highestprice', 'lowestprice', 'meanprice', 'medianprice'];
    }

    // handles the attribute updates
    attributeChangedCallback(attrName, oldValue, newValue) {
        let element;
    
        switch (attrName) {
            case 'flat_type':

                // referring to the an element in the current context and referencing if it exists 
                element = this.root.querySelector('#flat_type');
                break;
    
            case 'highestprice':
                element = this.root.querySelector('#highestprice');
                break;
    
            case 'lowestprice':
                element = this.root.querySelector('#lowestprice');
                break;
    
            case 'meanprice':
                element = this.root.querySelector('#meanprice');
                break;
    
            case 'medianprice':
                element = this.root.querySelector('#medianprice');
                break;
        }
    
        if (element) {
            element.textContent = newValue;
        } else {
            console.error(`Element with ID "${attrName}" not found.`);
        }
    
        // hides the labels based on selected filter
        const highestPriceLabel = this.root.querySelector('#highestPriceLabel');
        const lowestPriceLabel = this.root.querySelector('#lowestPriceLabel');
        const meanPriceLabel = this.root.querySelector('#meanPriceLabel');
        const medianPriceLabel = this.root.querySelector('#medianPriceLabel');
    
        const selectedFilter = localStorage.getItem('selectedFilter');
    
        if (selectedFilter === 'HLP') {

            // these would be hidden if the selected filter is HLP
            meanPriceLabel.style.display = 'none';
            medianPriceLabel.style.display = 'none';
        } else if (selectedFilter === 'MMP') {

            // these would be hidden if the selected filter is MMP
            highestPriceLabel.style.display = 'none';
            lowestPriceLabel.style.display = 'none';
        } else if (selectedFilter === 'BOTA') {

            // these would be shown if the selected filter is BOTA
            highestPriceLabel.style.display = '';
            lowestPriceLabel.style.display = '';
            meanPriceLabel.style.display = '';
            medianPriceLabel.style.display = '';
        } 
    }
}


///////////////////////////////////////////////////////////////////////////////////
// WEB COMPONENT USED TO DISPLAY THE PRICE OF FLATS 
///////////////////////////////////////////////////////////////////////////////////
class hdbPriceCards extends HTMLElement {
    constructor() {
        super();
    }

    async displayPrice() {
        // retrieves the selected town and filter type from local storage
        const selectedTown = localStorage.getItem('selectedTown');
        const selectedFilter = localStorage.getItem('selectedFilter');

        const response = await fetch(`http://localhost:8081/bytown/${encodeURIComponent(selectedTown)}`);
        const data = await response.json();

        const flat_types = {};
        data.forEach((item) => {
            const flat_type = item.flat_type;
            if (!flat_types[flat_type]) {
                flat_types[flat_type] = [];
            }
            flat_types[flat_type].push(item.resale_price);
        });

        function calculateMeanAndMedian(prices) {
            const sortedPrices = prices.slice().sort((a, b) => a - b);

            // calculates the mean
            const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
            const meanprice = mean.toFixed(2);

            // calculates the median
            const mid = Math.floor(sortedPrices.length / 2);
            const medianprice = sortedPrices.length % 2 !== 0 ? sortedPrices[mid] : (sortedPrices[mid - 1] + sortedPrices[mid]) / 2;

            return { meanprice, medianprice };
        }

        for (const flat_type in flat_types) {
            const prices = flat_types[flat_type];
            const priceCardInstance = document.createElement('price-card');
            priceCardInstance.setFlatType(flat_type);
    
            // sets the attributes based on the selected filter type
            if (selectedFilter === 'HLP') {
                priceCardInstance.setAttribute('highestPrice', Math.max(...prices).toString());
                priceCardInstance.setAttribute('lowestPrice', Math.min(...prices).toString());
            } else if (selectedFilter === 'MMP') {
                const { meanprice, medianprice } = calculateMeanAndMedian(prices);
                priceCardInstance.setAttribute('meanPrice', meanprice.toString());
                priceCardInstance.setAttribute('medianPrice', medianprice.toString());
            } else if (selectedFilter === 'BOTA') {
                const highestprice = Math.max(...prices);
                const lowestprice = Math.min(...prices);
                const { meanprice, medianprice } = calculateMeanAndMedian(prices);
    
                priceCardInstance.setAttribute('highestPrice', highestprice.toString());
                priceCardInstance.setAttribute('lowestPrice', lowestprice.toString());
                priceCardInstance.setAttribute('meanPrice', meanprice.toString());
                priceCardInstance.setAttribute('medianPrice', medianprice.toString());
            }
    
            this.appendChild(priceCardInstance);
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////
// CUSTOM ELEMENT REGISTRATION     
///////////////////////////////////////////////////////////////////////////////////
window.customElements.define('dropdown-selection', dropdownSelection);
window.customElements.define('hdb-price-card', hdbPriceCards);
window.customElements.define('price-card', priceCard);