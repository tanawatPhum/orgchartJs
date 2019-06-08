let cordinateArr = [];
let centerObj = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
};
let indexBoxs = 0;
let widthDefaultCircle = 20;
let heightDefaultCircle = 20;
let positionPartitionList = [];
let peopleList = [];
let totalCircle = 0;
let currentIndexCircle = 0;



$(document).ready(() => {
    $(window).resize(function() {
        $('#orgChart').empty();
        createOrgchart();
    })
    createZoomObj().then(() => {
        createOrgchart();
    })



});

function createOrgchart() {
    initCircle().then(() => {
        drawLine().then(() => {
            drawPeople();
        });
    });
}

async function createZoomObj() {
    const el = document.querySelector('#orgChart');
    let pz = new PinchZoom.default(el, {});
}

async function initCircle() {
    peopleList = await getTotalPeople();
    let totalCircle = peopleList.length
    widthDefaultCircle = 15;
    heightDefaultCircle = 15;
    for (let i = 0; i < totalCircle; i++) {
        currentIndexCircle = i;
        let typeCircle = "";
        const elementCircle = "#circle_" + i;
        if (i === 0) {
            typeCircle = "initial-circle";
        } else if (i % 2 === 0) {
            typeCircle = "even-circle";
        } else {
            typeCircle = "odd-circle";
        }
        $("#orgChart").append("<div id='circle_" + i + "' class='container-circle " + typeCircle + "'></div>");
        $(elementCircle).css("z-index", totalCircle - i);
        $(elementCircle).append("<div id='center-circle'></div>");
        $(elementCircle).css("width", widthDefaultCircle + "em");
        $(elementCircle).css("height", heightDefaultCircle + "em");
        if (i > 0) {
            $(elementCircle).css("width", widthDefaultCircle + i * 10 + "em");
            $(elementCircle).css("height", heightDefaultCircle + i * 10 + "em");
            await divideCircle(elementCircle);
        } else if (i === 0) {
            $(elementCircle).css("width", widthDefaultCircle + "em");
            $(elementCircle).css("height", heightDefaultCircle + "em");
            $(elementCircle).append("<div class='partition-list'></div>")
            if (peopleList[currentIndexCircle] && peopleList[currentIndexCircle].totalPeople > 0) {
                $(elementCircle).find(".partition-list").append("<div id='" + peopleList[currentIndexCircle].peopleDetail[0].id + "' class='box-people'></div>");
            }
            $(elementCircle).find(".box-people").addClass("initial-box-people");
        }
    }


}

async function divideCircle(elementCircle) {
    let x0;
    let y0;
    x0 = $(elementCircle).find("#center-circle").position().left;
    y0 = $(elementCircle).find("#center-circle").position().top;
    centerObj.left = x0;
    centerObj.top = y0;
    centerObj.width = 1;
    centerObj.height = 1;
    // console.log("center x,y" + x0, y0);
    let items = peopleList[currentIndexCircle].totalPeople * 2;
    let r = $(elementCircle).outerWidth() / 2;
    for (let i = 0; i < items; i++) {
        let cordObj = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            r: 0
        };
        let x = x0 + r * Math.cos(2 * Math.PI * i / items);
        let y = y0 + r * Math.sin(2 * Math.PI * i / items);
        cordObj.left = x;
        cordObj.top = y;
        cordObj.width = 1;
        cordObj.height = 1;
        cordObj.r = r;
        // console.log("x = " + x, "y = " + y);
        cordinateArr.push(cordObj);

    }
    drawPartition(elementCircle).then(() => {
        drawBox(elementCircle);
    });
}

async function drawPartition(elementCircle) {
    positionPartitionList = [];
    let color = "";
    let indexLine = 0;
    let cordinateArrLength = cordinateArr.length;
    while (cordinateArr.length !== 0) {
        let position = getPositionPartition();
        position['id'] = "partition_" + indexLine;
        positionPartitionList.push(position);
        // console.log("position obj = ", position);
        let htmlLine = "<div class='partition-list' id='partition_" + indexLine + "'style='z-index:" + (totalCircle - currentIndexCircle) + ";padding:0px; margin:0px; height:" + position.thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + position.cx + "px; top:" + position.cy + "px; width:" + position.length + "px; -moz-transform:rotate(" + position.angle + "deg); -webkit-transform:rotate(" + position.angle + "deg); -o-transform:rotate(" + position.angle + "deg); -ms-transform:rotate(" + position.angle + "deg); transform:rotate(" + position.angle + "deg);' />";
        let elementCircleForJS = elementCircle.replace("#", "");
        document.getElementById(elementCircleForJS).innerHTML += htmlLine;
        cordinateArr.splice(0, 1);
        indexLine += 1;
    }

}

async function drawBox(elementCircle) {
    let LineList = $(elementCircle).find(".partition-list");
    let countPushPeople = 0;
    LineList.each((index, element) => {
        if (countPushPeople < peopleList[currentIndexCircle].totalPeople) {
            if ($(elementCircle).hasClass("initial-circle")) {
                createBoxPeople(element, countPushPeople);
                countPushPeople += 1;
            } else if ($(elementCircle).hasClass("even-circle") && index % 2 !== 0) {
                createBoxPeople(element, countPushPeople);
                countPushPeople += 1;
            } else if ($(elementCircle).hasClass("odd-circle") && index % 2 === 0) {
                createBoxPeople(element, countPushPeople);
                countPushPeople += 1;
            }
        }
    });
}

function createBoxPeople(element, index) {
    let elementLine = $(element).attr("id");
    let positionPartition = positionPartitionList.find(elementP => elementP.id === elementLine);
    peopleList[currentIndexCircle].peopleDetail[index]['position'] = positionPartition
    let people = peopleList[currentIndexCircle].peopleDetail[index]
    let boxAngle = positionPartition.angle;
    if (positionPartition.angle < 0) {
        boxAngle = -(360 + (positionPartition.angle));
    } else {
        boxAngle = 360 - (positionPartition.angle);
    }
    $(element).append("<div id='" + people.id + "'  style='transform: rotate(" + boxAngle + "deg);' class='box-people'></div>");
    if (people.position === "A") {
        $(element).find(".box-people").css("margin-left", "-1.5em");
    } else {
        $(element).find(".box-people").css("margin-left", "0.6em");
    }
    // })


}
async function drawLine() {
    $("#orgChart").append("<svg id='svg'></svg>");
    peopleList.forEach((peopleInCircle) => {
        peopleInCircle.peopleDetail.forEach((people1) => {
            people1.childPeople.forEach((people2) => {
                if (people1.id !== people2.id) {
                    let div1 = $("#" + people1.id);
                    let div2 = $("#" + people2.id);

                    let x1 = (div1.offset().left + (div1.width() / 2) - $('.pinch-zoom-container').offset().left);
                    let y1 = (div1.offset().top + (div1.height() / 2) - $('.pinch-zoom-container').offset().top);
                    let x2 = (div2.offset().left + (div2.width() / 2) - $('.pinch-zoom-container').offset().left);
                    let y2 = (div2.offset().top + (div2.height() / 2) - $('.pinch-zoom-container').offset().top);

                    // console.log("element1", div2)
                    // console.log("createLineY", y2)
                    // console.log("createLineX", x2)
                    let newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    newLine.setAttribute('id', "#conection_" + people1.id + "_to_" + people2.id);
                    newLine.setAttribute('x1', x1);
                    newLine.setAttribute('y1', y1);
                    newLine.setAttribute('x2', x2);
                    newLine.setAttribute('y2', y2);
                    newLine.setAttribute('stroke-width', "0.5px");
                    newLine.setAttribute('stroke', "rgb(0, 0, 0)");
                    if (people2.lineType !== "RT") {
                        newLine.setAttribute('stroke-dasharray', "5, 5");
                    }
                    $("#orgChart").find("#svg").append(newLine);
                }
            })
        });
    })
}

async function drawPeople() {
    $(".container-circle").each((indexCircle, elementCircle) => {
        $(elementCircle).find(".box-people").each((indexBox1, elementBox1) => {
            let profile = peopleList[indexCircle].peopleDetail[indexBox1];
            profile = profile && profile.hasOwnProperty('profile') && profile.profile;
            console.log("Profile => ", profile)
            let div1 = $(elementBox1);
            let xI1 = (div1.offset().left - $('.pinch-zoom-container').offset().left);
            let yI1 = (div1.offset().top - $('.pinch-zoom-container').offset().top);

            // console.log("element2", div1)
            // console.log("createLineYI1", yI1)
            // console.log("createLineXI1", xI1)
            let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

            if (div1.hasClass("initial-box-people")) {
                foreignObject.setAttributeNS(null, 'height', '100');
                foreignObject.setAttributeNS(null, 'width', '75');
            } else {
                foreignObject.setAttributeNS(null, 'height', '70');
                foreignObject.setAttributeNS(null, 'width', '59');
            }



            // newImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'assets/imgs/test.png');
            foreignObject.setAttributeNS(null, 'x', xI1);
            foreignObject.setAttributeNS(null, 'y', yI1);
            let boxPeople = document.createElement('div');
            boxPeople.classList.add("box-people-interface");
            let imgPeople = document.createElement('img');
            imgPeople.src = profile['img'] || "assets/imgs/imgPeople.png";

            boxPeople.append(imgPeople);
            let boxIcon = document.createElement('div');
            boxIcon.className = "box-people-icon";
            if ($(elementCircle).hasClass("initial-circle")) {
                boxPeople.classList.add("initial-box-circle")
                foreignObject.setAttributeNS(null, 'y', yI1);
                boxIcon.classList.add("initial-icon-circle")
            } else if ($(elementCircle).hasClass("even-circle")) {
                boxPeople.classList.add("odd-box-circle")
                boxIcon.classList.add("odd-icon-circle")
            } else if ($(elementCircle).hasClass("odd-circle")) {
                boxPeople.classList.add("even-box-circle")
                boxIcon.classList.add("even-icon-circle")
            }
            let boxDesc = document.createElement('div');
            boxDesc.className = "box-people-desc";
            let fullname = document.createElement('span');
            fullname.className = "name";
            fullname.innerHTML = profile.fullName;
            boxDesc.append(fullname);

            let position = document.createElement('span');
            position.className = "job-position";
            position.innerHTML = profile.jobPosition;
            boxDesc.append(position);
            // boxDesc.textContent = profile.fullName;
            boxPeople.append(boxIcon);
            boxPeople.append(boxDesc);
            foreignObject.appendChild(boxPeople);
            $("#orgChart").find("#svg").append(foreignObject);
        });
    });
}

function getPositionPartition() {
    let thickness = 2;
    let off1 = centerObj;
    let off2 = cordinateArr[0];
    let x1 = off1.left + off1.width;
    let y1 = off1.top + off1.height;
    let x2 = off2.left + off2.width;
    let y2 = off2.top;
    let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    let cx = ((x1 + x2) / 2) - (length / 2);
    let cy = ((y1 + y2) / 2) - (thickness / 2);
    let angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
    return {
        cx: cx,
        cy: cy,
        angle: angle,
        length: length,
        thickness: thickness,
        r: off2.r
    };
}


//// service

async function getTotalPeople() {
    let peopleList = []
    peopleList = [{
            totalPeople: 1,
            peopleDetail: [{
                id: "box_0",
                position: "A",
                profile: {
                    img: 'https://img.icons8.com/color/420/person-male.png',
                    fullName: 'test',
                    jobPosition: 'positiontest'
                },
                childPeople: [
                    { id: "box_1", lineType: "RT" },
                    { id: "box_2", lineType: "RT" },
                ]
            }]
        },
        {
            totalPeople: 2,
            peopleDetail: [{
                    id: "box_1",
                    position: "D",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [
                        { id: "box_3", lineType: "RT" },
                        { id: "box_4", lineType: "RT" },
                    ]
                },
                {
                    id: "box_2",
                    position: "A",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [
                        { id: "box_5", lineType: "RT" },
                        { id: "box_6", lineType: "RT" },
                    ]
                }
            ]
        },
        {
            totalPeople: 4,
            peopleDetail: [{
                    id: "box_3",
                    position: "D",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [

                    ]
                },
                {
                    id: "box_4",
                    position: "D",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [

                    ]
                },
                {
                    id: "box_5",
                    position: "D",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [

                    ]
                },
                {
                    id: "box_6",
                    position: "D",
                    profile: {
                        img: 'https://img.icons8.com/color/420/person-male.png',
                        fullName: 'nametest',
                        jobPosition: 'positiontest'
                    },
                    childPeople: [

                    ]
                }
            ]
        }
    ]
    return peopleList;
}