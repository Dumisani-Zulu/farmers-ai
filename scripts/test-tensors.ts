// Quick test for tensor operations
import * as tf from '@tensorflow/tfjs';

// Test Sobel tensor creation
function testSobelTensors() {
  console.log('Testing Sobel tensor creation...');
  
  try {
    // Create Sobel kernels with correct shape [height, width, inChannels, outChannels]
    const sobelXData = [
      [-1, 0, 1],
      [-2, 0, 2], 
      [-1, 0, 1]
    ];
    
    const sobelYData = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];
    
    // Create kernels with shape [3, 3, 1, 1] for conv2d
    const sobelX = tf.tensor4d(sobelXData.flat(), [3, 3, 1, 1]);
    const sobelY = tf.tensor4d(sobelYData.flat(), [3, 3, 1, 1]);
    
    console.log('Sobel X shape:', sobelX.shape);
    console.log('Sobel Y shape:', sobelY.shape);
    
    // Test with a sample image tensor
    const sampleImage = tf.randomUniform([1, 224, 224, 1]) as tf.Tensor4D; // grayscale image
    
    // Apply convolution
    const edgesX = tf.conv2d(sampleImage, sobelX, 1, 'same');
    const edgesY = tf.conv2d(sampleImage, sobelY, 1, 'same');
    
    console.log('Edges X shape:', edgesX.shape);
    console.log('Edges Y shape:', edgesY.shape);
    
    // Clean up
    sobelX.dispose();
    sobelY.dispose();
    sampleImage.dispose();
    edgesX.dispose();
    edgesY.dispose();
    
    console.log('✅ Sobel tensor test passed!');
    
  } catch (error) {
    console.error('❌ Sobel tensor test failed:', error);
  }
}

// Test simple color analysis
function testColorAnalysis() {
  console.log('Testing color analysis...');
  
  try {
    // Create a mock RGB image
    const rgbImage = tf.randomUniform([1, 224, 224, 3]);
    
    // Split channels
    const [r, g, b] = tf.split(rgbImage.squeeze([0]) as tf.Tensor3D, 3, 2);
    
    // Calculate means
    const rMean = tf.mean(r).dataSync()[0];
    const gMean = tf.mean(g).dataSync()[0];
    const bMean = tf.mean(b).dataSync()[0];
    
    console.log('Color means - R:', rMean.toFixed(3), 'G:', gMean.toFixed(3), 'B:', bMean.toFixed(3));
    
    // Clean up
    rgbImage.dispose();
    r.dispose();
    g.dispose();
    b.dispose();
    
    console.log('✅ Color analysis test passed!');
    
  } catch (error) {
    console.error('❌ Color analysis test failed:', error);
  }
}

// Run tests
testSobelTensors();
testColorAnalysis();

console.log('🧪 All tensor tests completed!');
