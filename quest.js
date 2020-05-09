var INPUT_ELEMENTS = [];
var GLOBAL = 'g';

const NEGATION = "!";
const CONJUNCTION = "&";
const DISJUNCTION = "|";
const IMPLICATION = "->";
const EQUIVALENCE = "~";
const FORMULA_REGEXP = new RegExp('([(]([A-Z]|[0-1])((->)|(&)|(\\|)|(~))([A-Z]|[0-1])[)])|([(][!]([A-Z]|[0-1])[)])|([A-Z])|([0-1])','g');

let countAnswer = 0;
let n = 1;

function checkInconsistency(formula) {
    // var input = document.getElementById("inputText").value;
    let obj = calculateTableTruth(formula);

    if (!checkWithRegularExpressionFormula(formula)) {
        return false;
    } else if (formula == '1') {
        return false;
    } else if (formula == '0') {
        return false;
    } else if (obj.containsOnes === true) {
        return true;
    } else {
        return false;
    }

    // if (obj instanceof Object && obj.table !== undefined && checkWithRegularExpressionFormula(input)) {
    //     printTableTruth(obj.table, obj.symbolSize);
    //     document.getElementById("container").hidden = false;
    // } else {
    //     document.getElementById("container").hidden = true;
    // }
}

function checkWithRegularExpressionFormula(formula) {
    let form = formula;
    if (form.length == 1 && form.match(/[A-Z]|[0-1]/)) {
        return true;
    } else {
        while (true) {
            let initLength = form.length;
            form = form.replace(FORMULA_REGEXP, '1')
            if (form.length === initLength) {
                break;
            }
        }
        if ((form.length === 1) && (form.match(/1/))) {
            return true;
        } else {
            return false;
        }
    }
}

function calculateTableTruth(formula) {
    countAnswer = 0;
    n = 1;

    if(formula == '0') {
        countAnswer = 1;
        return {containsOnes: false};
    }

    if(formula == '1') {
        return {containsOnes: true};
    }

    if (formula == '') {
        return null;
    }

    if (formula.match(/[A-Z]/g) !== null) {
        let answer = formula;
        let symbolInFormula = calculateFormulaSymbols(formula).sort();
        let sizeSymbolInFormula = symbolInFormula.length;
        n = Math.pow(2, sizeSymbolInFormula);

        let table = {};
        for (let index = 0; index < n; index++) {
            let inputParameters = calculateInputFormulaParameters(index, sizeSymbolInFormula);
            let obj = createFormulaWithParameters(symbolInFormula, inputParameters);

            obj[answer] = getAnswer(formula, obj);
            table[index] = obj;

            if (obj[answer] == 0) {
                countAnswer++;
            }
        }
        var vals = Object.keys(table).map(function(key) {
            return table[key][Object.keys(table[key])[Object.keys(table[key]).length - 1]];
        });
        let containsOnes = false;
        if (vals.includes('1') && vals.includes('0')) {
            containsOnes = true;
        }
        return  {
            table: table,
            symbolSize: sizeSymbolInFormula,
            containsOnes: containsOnes
        };
    } else {
        containsOnes = (calculateFormula(formula) === '1' ? true : false);
        return {containsOnes: containsOnes};
    }
}

function calculateFormulaSymbols(formula) {
    const SYMBOL_REGEXP = new RegExp('([A-Z])', "g");
    let results = formula.match(SYMBOL_REGEXP);

    const a = [...new Set(results)];
    return a;
}

//Функция расчета входных параметров для формулы
function calculateInputFormulaParameters(index, symbolSize) {
    let res = index.toString(2);
    //дописывает 0, если не хватает разрядов
    for (let index = res.length; index < symbolSize; index++) {
        res = "0" + res;
    }

    return res;
}

//Создания объекта формулы со входными параметрами
function createFormulaWithParameters(symbolInFormula, inputParameters) {
    let object = {};
    for (let index = 0; index < symbolInFormula.length; index++) {
        let symbol = symbolInFormula[index];
        //связь входного символа формулы с его входным значением
        object[symbol] = inputParameters[index];
    }

    return object;
}

function getAnswer(formula, obj){
    let constFormula = formula;
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        //заменяем буквы значениями
        constFormula = constFormula.replace(new RegExp(key, 'g'), value);
    }
    return calculateFormula(constFormula);
}

function calculateFormula(formula) {
    const REGEXP = new RegExp("([(][" + NEGATION + "][0-1][)])|" + "([(][0-1]((" + CONJUNCTION + ")|("+ "\\" + DISJUNCTION + ")|(" + IMPLICATION + ")|(" + EQUIVALENCE + "))[0-1][)])");
    var array;
    while ((array = REGEXP.exec(formula)) !== null) {
        let subFormula = array[0];
        let result = calculateSimpleFormula(subFormula);
        formula = formula.replace(subFormula, result);
    }

    return formula;
}

function calculateSimpleFormula(subFormula) {
    if (subFormula.indexOf(NEGATION) > -1) {
        return calculateNegation(subFormula);
    }

    if (subFormula.indexOf(CONJUNCTION) > -1) {
        return calculateConjunction(subFormula);
    }

    if (subFormula.indexOf(DISJUNCTION) > -1) {
        return calculateDisjunction(subFormula);
    }

    if (subFormula.indexOf(IMPLICATION) > -1) {
        return calculateImplication(subFormula);
    }

    if (subFormula.indexOf(EQUIVALENCE) > -1) {
        return calculateEquivalence(subFormula);
    }
}

function calculateNegation(subFormula) {
    if (parseInt(subFormula[2]) == 1) {
        return 0;
    }
    return 1;
}

//Функция высчитывания конъюнкции
function calculateConjunction(subFormula) {
    if (parseInt(subFormula[1]) && parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания дизъюнкции
function calculateDisjunction(subFormula) {
    if (parseInt(subFormula[1]) || parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания импликации
function calculateImplication(subFormula) {
    if ((!parseInt(subFormula[1])) || parseInt(subFormula[4])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания эквиваленции
function calculateEquivalence(subFormula) {
    if (parseInt(subFormula[1]) == parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}



class Question {
    constructor(formula, answer) {
        this.formula = formula;
        this.answer = answer;
    }
}

var variablesCodes = [ 'A', 'B', 'C', 'D' ];

var currentQuestion = generateQuestion();
var countOfQuestions = 10;
var currentQuestionIndex = 1;
var correctAnswers = 0;

renderQuestion();
refreshAnswers();

var confirmButton = document.getElementById('confirmButton');
var nextButton = document.getElementById('nextButton');
var questSection = document.getElementById('questSection');
var resultSection = document.getElementById('resultSection');

nextButton.style.display = 'none';
resultSection.style.display = 'none';

function confirm() {
    let currentAnswerElement = document.getElementById(currentQuestion.answer.toString());
    let isCorrectAnswered = currentAnswerElement.checked;
    highlight(
        isCorrectAnswered ? currentQuestion.answer.toString() : (!currentQuestion.answer).toString(),
        isCorrectAnswered ? 'greenyellow' : 'red'
        );

    if (isCorrectAnswered) {
        correctAnswers++;
    }

    confirmButton.style.display = 'none'; 
    nextButton.style.display = 'flex';
}

function next() {
    ++currentQuestionIndex;
    if (currentQuestionIndex === countOfQuestions) {
        document.getElementById('score').innerHTML = 10 * correctAnswers / countOfQuestions;

        questSection.style.display = 'none';
        resultSection.style.display = 'flex';
        document.
        return;
    }

    currentQuestion = generateQuestion();

    renderQuestion();
    refreshAnswers();

    confirmButton.style.display = 'flex';
    nextButton.style.display = 'none';
}

function generateQuestion() {
    let countOfArgs = getRandomInt(3);
    let countOfGroups = getRandomInt(Math.pow(2, countOfArgs));

    let formula = generateFormula(countOfGroups, countOfArgs);
    // console.log(formula)
    // console.log(checkSknf(formula))
    let answer = checkInconsistency(formula);

    return new Question(formula, answer);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

function generateFormula(countOfGroups, countOfArgs) {
    let formula = '';
    var variablesCodes = [ 'A', 'B', 'C'];


    for (i = 0; i < countOfGroups; i++) {
        let countOfArgsInParticualarGroup = countOfArgs - getRandomInt(countOfArgs) + 1;
        let group = '';

        if (countOfGroups !== 1 && i < countOfGroups - 1) {
            formula += '(';
        }

        for (j = 0; j < countOfArgsInParticualarGroup; j++) {
            if (countOfArgsInParticualarGroup !== 1 && j < countOfArgsInParticualarGroup - 1) {
                group += '(';
            }

            let isNegative = (Math.random() >= 0.5);
            group += (isNegative ? '(!' : '') + variablesCodes[j] + (isNegative ? ')' : '');
            if (j < countOfArgsInParticualarGroup - 1) {
                let random  = Math.random();
                group += ((random >= 0.2) ? '|' : (random >= 0.1 ? '&' : (random >= 0.05 ? '~' : '->')));
            }
        }

        for (j = 0; j < countOfArgsInParticualarGroup - 1; j++) {
            if (countOfArgsInParticualarGroup !== 1) {
                group += ')';
            }
        }

        formula += group;

        if (i < countOfGroups - 1) {
            let random  = Math.random();
            formula += ((random >= 0.3) ? '|' : (random >= 0.2 ? '&' : (random >= 0.1 ? '~' : '->')));
        }
    }

    for (j = 0; j < countOfGroups - 1; j++) {
        if (countOfGroups !== 1) {
            formula += ')';
        }
    }

    return formula;
}

function renderQuestion() {
    document.getElementById('formula').innerHTML = currentQuestion.formula;
}

function refreshAnswers() {
    document.getElementById(currentQuestion.answer.toString() + 'Label').style.color = 'aliceblue';
    document.getElementById((!currentQuestion.answer).toString() + 'Label').style.color = 'aliceblue';
    document.getElementById(currentQuestion.answer.toString()).checked = false;
    document.getElementById((!currentQuestion.answer).toString()).checked = false;
}

function highlight(answerId, color) {
    let answerElement = document.getElementById(answerId + 'Label');
    answerElement.style.color = color;
}