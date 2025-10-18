export const signup = (req, res) => {
    try {
        //req - data coming from front-end
        const { userName, fullName, email, password } =  req.body;

    } catch(error) {
        console.log(`Error in signup controller ${error}`);
        res.status(500).json({error: "Internal server error"})
    }
}
export const login = (req, res) => {
    res.send("Login Controller");
}
export const logout = (req, res) => {
    res.send("Logout Controller");
}
