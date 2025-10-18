import { body, validationResult } from "express-validator";
export const validate = (validations) => {
    //this accepts an argument which is the validation chain that would be used
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                break;
            }
        }
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        return res.status(422).json({ errors: errors.array() });
    };
};
export const loginValidator = [
    body("email").trim().isEmail().withMessage("Email is Required!"),
    body("password").trim().isLength({ min: 6 }).withMessage("Password should contain at least 6 characters")
];
export const signupValidator = [
    //we want to store validator checks in this array
    body("name").trim().notEmpty().withMessage("Name is Required!"),
    ...loginValidator,
];
export const chatCompletionValidator = [
    body("message").notEmpty().withMessage("Message is Required!"),
];
//# sourceMappingURL=validators.js.map