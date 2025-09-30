import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Gift, Users, DollarSign, Info } from "lucide-react";

const ReferralProgram = () => {
  return (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center mb-4 fw-bold">🎁 CleanAR Referral Rewards</h2>
        <p className="lead text-center mb-5">
          Invite friends and family to try CleanAR Solutions! 
          Earn exclusive discounts on your next cleaning service after their first service is completed and paid in full.
        </p>

        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center">
                <Users size={32} className="text-primary mb-3" />
                <Card.Title>1–3 Referrals</Card.Title>
                <Card.Text>Get <strong>10% off</strong> each booking.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center">
                <Gift size={32} className="text-success mb-3" />
                <Card.Title>4–7 Referrals</Card.Title>
                <Card.Text>Get <strong>20% off</strong> each booking.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center">
                <DollarSign size={32} className="text-warning mb-3" />
                <Card.Title>8+ Referrals</Card.Title>
                <Card.Text>
                  Get <strong>50% off</strong> one full-service cleaning.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center">
          <Button
            size="lg"
            variant="primary"
            href="/referral"
            className="shadow mb-3"
          >
            Get Your Referral Link
          </Button>

          <p className="small text-muted">
            Discounts apply after the referred client’s first cleaning is completed and paid in full. 
            Non-transferable, cannot be combined with other offers, and apply to your next scheduled service. 
            <br />
            <a href="/terms" className="text-decoration-underline">
              View full program terms
            </a>.
          </p>
        </div>
      </Container>
    </section>
  );
};

export default ReferralProgram;
