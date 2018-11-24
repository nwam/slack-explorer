"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express in my butt', p2: "poo poo" });
});
module.exports = router;
//# sourceMappingURL=index.js.map