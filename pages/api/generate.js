// Import the required modules from the OpenAI package
import { Configuration, OpenAIApi } from "openai";

// Create a configuration object using the API key from the environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Instantiate an OpenAIApi client with the created configuration
const openai = new OpenAIApi(configuration);

// Export the main function as the default export
export default async function (req, res) {
  // Check if the API key is present
  if (!configuration.apiKey) {
    // Return a 500 error response if the API key is not configured
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  // Get the animal name from the request body, or use an empty string as the default value
  const animal = req.body.animal || '';
  
  // Check if the animal name is valid (not empty after trimming)
  if (animal.trim().length === 0) {
    // Return a 400 error response if the animal name is not valid
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  // Wrap the API call in a try-catch block to handle errors
  try {
    // Call the OpenAI API to generate a completion based on the prompt
    const completion = await openai.createCompletion({
      model: "text-davinci-003", // Specify the model to use
      prompt: generatePrompt(animal), // Generate the prompt using the animal name
      temperature: 0.6, // Set the temperature for the generated text
    });
    
    // Return the generated text as part of the response
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    // Handle errors that occur during the API call
    if (error.response) {
      // Log the error details and return an error response with the same status code
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      // Log the error message and return a generic 500 error response
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

// Helper function to generate the prompt for the OpenAI API
function generatePrompt(animal) {
  // Capitalize the first letter of the animal name and make the rest of the string lowercase
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
    
  // Generate the prompt string based on the capitalized animal name
  return `Suggest four names for an animal that is a computer programer.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
