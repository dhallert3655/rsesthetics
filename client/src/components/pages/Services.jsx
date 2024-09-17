import { Box, Image, Flex, Button, Spinner, Text } from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client";
import { GETSERVICES } from '../../utils/queries';
import { REMOVESERVICE } from "../../utils/mutations";
import { useAuth } from '../../utils/auth';
import { Link } from "react-router-dom";
import { facial, placeholder, permMakeup, esth, waxed, bev } from "../../assets/index"; // Import all required images here

// ServiceCard component for displaying individual services
function ServiceCard({ title, price, description, imageSrc }) {
  return (
    <Flex 
      className="serviceCardContainer" 
      alignItems={{ base: "flex-start", md: "center" }} 
      mb={8} 
      flexDirection={{ base: "column", md: "row" }} // Stack vertically on smaller screens
    >
      <Image
        src={imageSrc || placeholder}
        alt={title}
        boxSize={{ base: "100px", md: "150px" }} // Smaller size for mobile
        objectFit="cover"
        borderRadius="full"
        mr={{ base: 0, md: 6 }} // Remove margin on mobile
        mb={{ base: 4, md: 0 }} // Add margin-bottom on mobile
      />
      <Box>
        <Text className="card-title" fontSize="xl" fontWeight="bold">{title}</Text>
        <Text className="price" fontSize="md" color="gray.500">{`$${price}`}</Text>
        <Text className="description" fontSize="md" mt={2}>{description}</Text>
      </Box>
    </Flex>
  );
}


// Section component for organizing services under a particular category with a header and image
function Section({ header, description, imageSrc, services = [] }) {
  return (
    <Box mb={12}>
      <Flex 
        alignItems="center" 
        mb={8} 
        flexDirection={{ base: "column", md: "row" }} // Stack image and text on mobile
        textAlign={{ base: "center", md: "left" }} // Center text on mobile
      >
        <Image
          src={imageSrc || placeholder}
          alt={header}
          boxSize={{ base: "200px", md: "350px" }} // Adjust image size for mobile
          objectFit="cover"
          borderRadius="md"
          mb={{ base: 4, md: 0 }} // Add margin-bottom on mobile
          mr={{ base: 0, md: 6 }} // Remove margin-right on mobile
        />
        <Box>
          <Text fontSize="3xl" fontWeight="bold" mb={4}>
            {header}
          </Text>
          <Text fontSize="lg" lineHeight="tall">
            {description}
          </Text>
        </Box>
      </Flex>
      {services.map((service) => (
        <ServiceCard
          key={service._id}
          title={service.title}
          price={service.price}
          description={service.description}
          imageSrc={service.imageSrc}
        />
      ))}
    </Box>
  );
}



const ServicesPage = () => {
  const { loading, data } = useQuery(GETSERVICES);
  const [removeService] = useMutation(REMOVESERVICE);
  const { isAuthenticated, user } = useAuth();

  if (loading) return <Spinner size="xl" />;

  const permanentMakeupServices = data?.getServices?.filter(service => service.category === "Permanent Makeup") || [];
  const estheticsServices = data?.getServices?.filter(service => service.category === "Esthetics Services") || [];
  const waxingServices = data?.getServices.filter(service => service.category === "Waxing Services") || [];

  async function handleDeletion(serviceInfo) {
    if (confirm(`You almost deleted ${serviceInfo.title}, Are you sure you want to do that?.`)) {
      try {
        const { data } = await removeService({
          variables: { deleteServiceId: serviceInfo._id }
        });
        if (data) {
          alert('Service Deleted!');
          window.location.reload(); // Reload the page to reflect changes
        }
      } catch (error) {
        console.error('Error removing service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  }

  return (
    <Box p={5}>
      {/* Permanent Makeup Section */}
      <Section
        header="Permanent Makeup"
        description="Transform your beauty effortlessly with our Permanent Makeup services. Deidre brings experience and expert training to ensure you achieve a lasting, flawless look. If you are looking for impeccable brows, subtly stunning eyeliner, or beautifully tinted lips, you have come to the right place!"
        imageSrc={permMakeup} // Replace with appropriate image
        services={permanentMakeupServices}
      />

      {/* Esthetics Services Section */}
      <Section
        header="Esthetics Services"
        description="Discover our premium esthetics services designed to rejuvenate and enhance your natural beauty. From revitalizing facials and luxurious lash lifts to precise brow laminations and more, Deidre provides personalized treatments to leave you feeling refreshed and radiant."
        imageSrc={bev} // Replace with appropriate image
        services={estheticsServices}  
      />

      <Section
        header="Waxing Services"
        description="Experience smooth, flawless skin with our expert waxing services. We specialize in precision brow shaping, as well as comprehensive waxing for legs, arms, and Brazilians. Deidre will ensure a comfortable and efficient process for beautifully hair-free results!"
        imageSrc={waxed}
        services={waxingServices}  // Add an empty array if there are no services
      />
      
      {/* Admin Controls for each service (Delete/Update buttons) */}
      {isAuthenticated && user && user.isAdmin && (
        <Box mt={8}>
          {data.getServices.map((service) => (
            <Box key={service._id} mb={4}>
              <Box mb={2} textAlign="right">
                <Link to={`/update/${service._id}`}>
                  <Button size="xs" bg="gray" variant="ghost" m={5}>
                    Update
                  </Button>
                </Link>
                <Button size="xs" bg="red" variant="ghost" m={5} onClick={() => handleDeletion(service)}>
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ServicesPage;

