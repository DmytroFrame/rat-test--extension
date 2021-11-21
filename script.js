function getTestInfo() {
    const testInfo = {
        userName: document.querySelector('.usertext').innerText,
        isTestOver: false,
        startTestDate: null,
        finalTestDate: null,
        userScores: null,
        maxScores: null,
        doneTest: null,
        maxTest: null,
    }

    const cells = []
    for (let item of document.querySelectorAll('.cell')) {
        cells.push(item.innerHTML)
    }

    for (let i = 0; i < cells.length; i += 2) {
        switch (cells[i]) {
            case "Розпочато":
                testInfo.startTestDate = cells[i +1]
                break
    
            case "Стан":
                if (cells[i +1] === "Завершено") {
                    testInfo.isTestOver = true
                }
                break
            
            case "Завершено":
                testInfo.finalTestDate = cells[i +1]
                break
    
            case "Балів":
                testInfo.doneTest = cells[i +1].split('/')[0]
                testInfo.maxTest = cells[i +1].split('/')[1]
                break
    
            case "Оцінка":
                if (cells[i +1].split(' ')[2] === 'можливих') {
                    testInfo.maxScores = cells[i +1].split(' ')[3]
                } else {
                    testInfo.maxScores = cells[i +1].split(' ')[2]
                }
                testInfo.userScores = cells[i +1].split(' ')[0].replace('<b>', '').replace('</b>', '')
                break
        }
    }
    return testInfo
}

function getPathTest() {
    let pathTest = ''
    for (let item of document.querySelectorAll('.breadcrumb-item')) {
        item = item.innerHTML
        if (item.split('>').length === 1) {
            pathTest += item + '/'
        } else {
            pathTest += item.split('>')[1].split('<')[0] + '/'
        }
    }
    return pathTest.slice(0, -1)
}

function getTestsResult() {
    function getTypeTest(querySelector) {
        const pathTestHtml = querySelector.innerHTML
        if (pathTestHtml.search('<input type="radio"') !== -1) {
            return 'radio'

        } else if (pathTestHtml.search('<input type="checkbox"')  !== -1) {
            return 'checkbox'

        } else if (pathTestHtml.search('<select')  !== -1) {
            return 'select'
            
        } else if (pathTestHtml.search('<input type="text"')  !== -1) {
            return 'input'
            
        } else {
            return null
        }
    }

    function arrayFilterAndPush(querySelector, pushTo) {
        const testArray = querySelector.innerText.split('\n')
        for (let i = testArray.length -1; i > 0; i -= 2) {
            pushTo.push(testArray[i])
        }
    }

    function getTestTypeSelect(testId) {
        function getTitle(testPath, index) {
            return document.querySelector(
                `#question-${testPath} > div.content > div.formulation.clearfix > div.ablock > table > tbody > tr:nth-child(${index}) > td.text`
            ).textContent
        }
    
        function getSelect(testPath, index) {
            const element = document.querySelector(`#menuq${testPath.replace('-', '\\:')}_sub${index}`)
            return element.options[element.selectedIndex].text
        }
    
        function getAllOptions(testPath) {
            optionArray = []
            const element = document.querySelector(`#menuq${testPath.replace('-', '\\:')}_sub0`)
            for (let item of element.options) {
                optionArray.push(item.text)
            }
            return optionArray
        }
        
        const userSelect = []
        const optionSelect  = []
        optionSelect.push(getAllOptions(testId))
        const thisTest = document.querySelector(`#question-${testId} > div.content > div.formulation.clearfix > div.ablock > table > tbody`)

        for (let i = 0; i < thisTest.childElementCount; i++) {
            const title = getTitle(testId, i +1)
            userSelect.push(`${title } → ${ getSelect(testId, i) }`)
            optionSelect.push(title)
        }
        return {optionSelect, userSelect}
        
    }

    function parsingTest(test) {
        const testResult =  {
            testType: null,
            title: null,
            options: [],
            selectOptions: [],
            rightAnswer: null,
            ball: {
                had: null,
                from: null
            } 
        }

        const bal = test.querySelector('div.info > div.grade').innerText.split(' ')
        testResult.ball = { had:bal[1], from: bal[3] }
        
        const titleElement = test.querySelector("div.content > div > div.qtext")
        testResult.title = titleElement.innerText

        testResult.testType = getTypeTest(test.querySelector("div.content > div.formulation.clearfix"))
        
        try {
            testResult.rightAnswer = test.querySelector("div.content > div.outcome.clearfix > div > div").innerHTML.replace('Правильна відповідь: ', '').replace('Правильні відповіді: ', '')
        } catch (error) {
            testResult.rightAnswer = null
        }
       
        
        if (testResult.testType === "input") {
            testResult.selectOptions.push(test.querySelector("div.content > div.formulation.clearfix > div ").innerHTML.split('value="')[1].split('"') )

        } else if (testResult.testType === "select") {
            const {optionSelect, userSelect} = getTestTypeSelect(test.id.replace('question-', ''))
            testResult.selectOptions = optionSelect
            testResult.options = userSelect

        } else {
            const testArray = test.querySelector("div.content > div.formulation.clearfix > div.ablock")
            arrayFilterAndPush(testArray, testResult.options)

            try {
                const correctArray = test.querySelector("div.content > div.formulation.clearfix > div.ablock").querySelectorAll('.correct')
                for (let element of correctArray) {
                    arrayFilterAndPush(element, testResult.selectOptions)
                } 
            } catch (error) {
                console.log('fuck', error)
            }   
        }
        return testResult        
    }

    const tests = []
    for (let test of document.querySelectorAll('.deferredfeedback')) {
        try {
            tests.push(parsingTest(test))
        } catch (error) {
            console.log(error)
        }
    }
    return tests
}


const info = getTestInfo()
const path = getPathTest()
const tests = getTestsResult()

console.log(path)
console.table(info)
console.table(tests)

// fetch("http://localhost:3000/", {
//     "method": "POST",
//     "headers": {
//         "Content-Type": "application/json"
//     },
//     "body": JSON.stringify({info, path, tests})
//     })
//     .then(response => {
//     console.log(response);
//     })
//     .catch(err => {
//     console.error(err);
//     });


