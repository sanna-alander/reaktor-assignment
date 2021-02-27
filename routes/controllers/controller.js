
const manufacturers = [];

const getData = async(type) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/products/'+type;
    const response = await fetch(api_url);
    const data = await response.json();
    return data;
}

const gloves = new Promise(
    (resolve) => resolve(getData('gloves'))
);
const masks = new Promise(
    (resolve) => resolve(getData('facemasks'))
);
const beanies = new Promise(
    (resolve) => resolve(getData('beanies'))
);

const responses = await Promise.all([gloves, masks, beanies]);
let all_data = [];
let gloves_data = [];
let masks_data = [];
let beanies_data = [];

for (const res of responses) {
    all_data = all_data.concat(res);
    if (res[0].type == 'gloves') {gloves_data = res}
    else if (res[0].type == 'facemasks') {masks_data = res}
    else if (res[0].type == 'beanies') {beanies_data = res}
}

for (const i of all_data) {
    if (!manufacturers.includes(i.manufacturer)) {
        manufacturers.push(i.manufacturer);
    }
}

const availabilities = {};

const getAvailability = async(brand) => {
    const api_url = 'https://bad-api-assignment.reaktor.com/v2/availability/'+brand;
    const response1 = await fetch(api_url);
    const data = await response1.json();

    availabilities[brand] = {};
    if (data.response.length > 2) {
        console.log(data.response.length);
        for (const j of data.response) {
            if (j.DATAPAYLOAD) {
                availabilities[brand][j.id] = j.DATAPAYLOAD.substring(50, j.DATAPAYLOAD.length-31);
            }
        }
    }   
}
const promises = [];

for (const m in manufacturers) {
    promises.push(
        new Promise((resolve) => resolve(getAvailability(manufacturers[m])))
    );
}

await Promise.all(promises);


const addAvailability = async(data) => {

    for (const item of data) {
        const m_id = item.id.toUpperCase();
        if (availabilities[item.manufacturer][m_id]) {
            item["availability"] = availabilities[item.manufacturer][m_id];
        } else {
            item["availability"] = 'UNKNOWN'; 
        }

    }

    return data;
}

const data = {
    gloves: await addAvailability(gloves_data),
    masks: await addAvailability(masks_data),
    beanies: await addAvailability(beanies_data)
};

const showGloves = async({render}) => {
    render('gloves.ejs', data);
}

const showMasks = async({render}) => {
    render('masks.ejs', data);
  }

const showBeanies = async({render}) => {
    render('beanies.ejs', data);
}


export { showGloves, showMasks, showBeanies }