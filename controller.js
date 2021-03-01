
//A collection keeping track of the manufacturers
let manufacturers = [];

//A counter to keep count of the brand data currently being fetched
let getCount = 3;

//All the possible product types
const types = ['gloves', 'facemasks', 'beanies'];

let gloves = [];
let masks = [];
let beanies = [];

//This function gets the data of the product type given to it as a parameter
const getData = async(type) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/products/'+type;
    const response = await fetch(api_url);
    try {
        const data = await response.json();
        if (type == 'gloves') gloves = data;
        if (type == 'facemasks') masks = data;
        if (type == 'beanies') beanies = data;
    }
    catch(err) {
        console.log(err);
    }
    finally {
        getCount--;
    }
}

//The first fetch of product data, done before the app turns on
const promises1 = [];
for (const t of types) {
    promises1.push(
        new Promise((resolve) => resolve(getData(t)))
    );
}
await Promise.all(promises1);

//Adding all manufacturers to the manufacturers -collection
for (const i of gloves.concat(masks, beanies)) {
    if (!manufacturers.includes(i.manufacturer)) {
        manufacturers.push(i.manufacturer);
    }
}

//Initialiting the dictionary for tha availabilities of the products
const availabilities = {};
for (const ma of manufacturers) {
    availabilities[ma] = {};
}

//A counter to keep count of the brand data being currently fetched
let counter = manufacturers.length;

//This function retrieves availability data from the API and puts it in the dictionary
const getAvailability = async(brand) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/availability/'+brand;
    const response1 = await fetch(api_url);
    try {
        const data = await response1.json();
        if (data.response.length > 2) {
            console.log(brand + " success");
            for (const j of data.response) {
                if (j.DATAPAYLOAD) {
                    availabilities[brand][j.id] = j.DATAPAYLOAD.substring(50, j.DATAPAYLOAD.length-31);
                }
            }
        } else {
            console.log(brand + " fetch failed");
        }
        console.log(counter-1 + "/" + manufacturers.length + " fetches left");
    }
    catch(err) {
        console.log(err);
    } 
    finally {
        counter--;
    }  
}

//The first fetch of availabilities, done in the background
const promises = [];
for (const m of manufacturers) {
    promises.push(
        new Promise((resolve) => resolve(getAvailability(m)))
    );
}
Promise.all(promises);

//Adds the availability value to each item. If the value can't be found yet then puts 'LOADING...'
//All availabilities have the value 'LOADING...' at the beginning but after some refreshes the values start appearing
//after the availability values have been fetched.
const addAvailability = (data) => {
    for (const item of data) {
        const m_id = item.id.toUpperCase();
        if (availabilities[item.manufacturer][m_id]) {
            item["availability"] = availabilities[item.manufacturer][m_id];
        } else {
            item["availability"] = 'LOADING...'; 
        }
    }
    return data;
}

//Object that stores all data of the items
const data = {
    gloves: addAvailability(gloves),
    masks: addAvailability(masks),
    beanies: addAvailability(beanies)
};

//A middleware to update the values. Updating is done in the background so the app keeps running.
const middleware = async(context, next) => {
    
    //If no fetches is currently going on to the API where the product data is when page refreshes then starts fetching.
    if (getCount === 0) {
        getCount = 3;
        const promises1 = [];
        for (const t of types) {
            promises1.push(
                new Promise((resolve) => resolve(getData(t)))
            );
        }
        Promise.all(promises1);
    }

    //Updates manufacturer list
    manufacturers = [];
    for (const i of gloves.concat(masks, beanies)) {
        if (!manufacturers.includes(i.manufacturer)) {
            manufacturers.push(i.manufacturer);
        }
    }

    //Updates availabilty values
    data.gloves = addAvailability(gloves);
    data.masks = addAvailability(masks);
    data.beanies = addAvailability(beanies);

    //If no fetches is currently going on to the API where the availability data is when page refreshes 
    //then starts fetching
    if (counter === 0) {
        counter = manufacturers.length;
        const promises = [];
        for (const m of manufacturers) {
            promises.push(new Promise((resolve) => resolve(getAvailability(m))));
        }
        Promise.all(promises);      
    } 
    await next();
  }

const showGloves = async({render}) => {
    render('items.ejs', { items: data.gloves });
}

const showMasks = async({render}) => {
    render('items.ejs', { items: data.masks });
  }

const showBeanies = async({render}) => {
    render('items.ejs', { items: data.beanies });
}

const showLanding = ({render}) => {
    render('landing.ejs')
}


export { showGloves, showMasks, showBeanies, showLanding, middleware }