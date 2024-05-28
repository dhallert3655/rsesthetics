<!-- Key Points:
Sanitizing Input: The htmlspecialchars() function is used to prevent XSS (Cross-Site Scripting) attacks.
Email Validation: The filter_var() function ensures the provided email address is valid.
Recipient Email Address: Replace "your-email@example.com" with the email address where you want to receive the form submissions.
Email Headers: The From header is set to the email address provided by the user. -->

<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require __DIR__ . '/vendor/autoload.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load environment variables from .env file
$dotenv = Dotenv::createImmutable(__DIR__);
try {
    $dotenv->load();
} catch (Exception $e) {
    die('Could not load .env file: ' . $e->getMessage());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize form data
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format";
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.sendgrid.net'; // Set the SMTP server to send through
        $mail->SMTPAuth   = true;
        $mail->Username   = 'apikey'; // SendGrid's SMTP username (always 'apikey')
        $mail->Password   = getenv('SENDGRID_API_KEY'); // SendGrid API key from environment variable
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        //Recipients
        $mail->setFrom(getenv('EMAIL_FROM'), 'Mailer');
        $mail->addAddress(getenv('EMAIL_TO'), 'Malcolm Franklin'); // Add a recipient

        // Content
        $mail->isHTML(false); // Set email format to plain text
        $mail->Subject = 'New Contact Form Submission from ' . $name;
        $mail->Body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";

        $mail->send();
        echo 'Message has been sent';
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    echo "Invalid request method.";
}
?>