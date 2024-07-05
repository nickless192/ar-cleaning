import React from "react";
import Auth from "../../utils/auth";
import Logo from "../../assets/svg/cleanmart-blue.svg";

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
  Row,
  Col
} from "reactstrap";

// core components
// import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

function LoginPage() {

  const [formData, setFormData] = React.useState({
    username: "",
    password: ""
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (formData.username && formData.password) {
      // console.log(body);
      fetch('/api/users/login/', {
        method: 'post',
        // mode: 'no-cors',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (response.ok) {
            console.log("you're logged!");
            response.json()
            .then(data => {
              console.log(data);
              console.log(data.dbUserData.adminFlag);  
              Auth.login(data.token, data.dbUserData.adminFlag);


          });
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

    
    }
  } 

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    console.log(name, value);
    console.log(formData);
    setFormData({ ...formData, [name]: value });
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
      <Navbar />
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/stock-photo-cropped-photo-responsible-cleaner-safety-protocols-placing-yellow-caution-sign.jpg") + ")"
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="4">
              <Card className="card-login card-plain">
                <Form onSubmit={(e) => handleFormSubmit(e)} className="form">
                  <CardHeader className="text-center">
                    <div className="logo-container">
                      <img src={Logo} alt="CleanAR Solutions Logo" />
                    </div>
                  </CardHeader>
                  <CardBody>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (formData.username ? " input-group-focus" : "")
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
                        onChange={(e) => handleChange(e)}
                      ></Input>
                    </InputGroup>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (formData.password ? " input-group-focus" : "")
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
                        onChange={(e) => handleChange(e)}
                      ></Input>
                    </InputGroup>
                  </CardBody>
                  <CardFooter className="text-center">
                    <Button
                      block
                      className="btn-round"
                      type="submit"
                      color="info"
                      size="lg"
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Form>
              </Card>
            </Col>
          </Container>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default LoginPage;
