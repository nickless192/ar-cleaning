import React from "react";
import Auth from "../../utils/auth";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col
} from "reactstrap";

// core components
// import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import IndexNavbar from "components/Navbars/IndexNavbar";
import TransparentFooter from "components/Footers/TransparentFooter.js";

function LoginPage() {
  const [username, setUsername] = React.useState(false);
  const [password, setPassword] = React.useState(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (username && password) {
      // const response = await 
      const body = {
        username: username.username,
        password: password.password
      };
      // console.log(body);
      fetch('/api/users/login/', {
        method: 'post',
        // mode: 'no-cors',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          // 'Access-Control-Allow-Credentials': 'true',
          // 'accept': 'application/json',
        }
      })
        .then(response => {
          if (response.ok) {
            // console.log("you're logged!");
            response.json()
            .then(data => {
              console.log(data);
              console.log(data.dbUserData.adminFlag);  
              Auth.login(data.token, data.dbUserData.adminFlag);
              

          });
            // fetch('/index');
            // document.location.replace('/index');
          }
          else {
            // alert(response.statusText)
            if (response.status === 404) {
              alert("User not found")
            }
            else if (response.status === 401) {
              alert("Wrong password!")
            }
            console.log(response)
          }
        })
        .catch(err => console.log(err))

      // if (response.ok) {
      //   fetch('/index');
      //   document.location.replace('/index');
      // } else {
      //   alert(response.statusText);
      // }
    }
  } 

  const handleChange = (event) => {
    const { name, value } = event.target;
    // console.log(event.target);
    // console.log(name);
    if (name === "username") {
      setUsername({
        [name]: value
      })
    }
    if (name === "password") {
      setPassword({
        [name]: value
      })
    }
    console.log(username.username);
    console.log(password.password);
  };


  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);
  return (
    <>
      <IndexNavbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/login.jpg") + ")"
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Card className="card-login card-plain">
                <Form action="" className="form" method="">
                  <CardHeader className="text-center">
                    <div className="logo-container">
                      <img
                        alt="..."
                        src={require("assets/img/now-logo.png")}
                      ></img>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (username ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons users_single-02"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Username..."
                        type="text"
                        id="username"
                        name="username"
                        onBlur={(e) => handleChange(e)}
                      ></Input>
                    </InputGroup>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (password ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons objects_key-25"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Password..."
                        type="password"
                        id="password"
                      name="password"
                        onBlur={(e) => handleChange(e)}
                      ></Input>
                    </InputGroup>
                  </CardBody>
                  <CardFooter className="text-center">
                    <Button
                      block
                      className="btn-round"
                      color="info"
                      href="#pablo"
                      onClick={(e) => handleFormSubmit(e)}
                      size="lg"
                    >
                      Get Started
                    </Button>
                    {/* <div className="pull-left">
                      <h6>
                        <a
                          className="link"
                          href="/signup-page"
                          onClick={(e) => e.preventDefault()}
                        >
                          Create Account
                        </a>
                      </h6>
                    </div>
                    <div className="pull-right">
                      <h6>
                        <a
                          className="link"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                        >
                          Need Help?
                        </a>
                      </h6>
                    </div> */}
                  </CardFooter>
                </Form>
              </Card>
            </Col>
          </Container>
        </div>
        <TransparentFooter />
      </div>
    </>
  );
}

export default LoginPage;
