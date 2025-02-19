// import React, { useState, useEffect } from 'react';
// import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
// import { useRouter } from 'expo-router';
// import { FontAwesome } from '@expo/vector-icons';
// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';

// // Define theme colors
// const Colors = {
//   light: {
//     tint: '#4CAF50',
//     background: '#FFFFFF',
//     text: '#000000',
//     secondaryText: '#666666',
//     card: '#f5f5f5',
//   },
//   dark: {
//     tint: '#66BB6A',
//     background: '#121212',
//     text: '#FFFFFF',
//     secondaryText: '#AAAAAA',
//     card: '#1E1E1E',
//   }
// };

// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'Good Morning';
//   if (hour < 17) return 'Good Afternoon';
//   return 'Good Evening';
// };

// // TypeScript interfaces
// interface NutritionData {
//   calories: { consumed: number; goal: number };
//   protein: { consumed: number; goal: number };
//   carbs: { consumed: number; goal: number };
//   fats: { consumed: number; goal: number };
// }

// interface MacroCardProps {
//   title: string;
//   current: number;
//   goal: number;
// }

// interface MealCardProps {
//   mealType: string;
//   title: string;
//   calories: number;
//   time: string;
// }

// interface RecipeCardProps {
//   title: string;
//   author: string;
//   rating: number;
//   time: string;
// }

// export default function HomeScreen() {
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userName, setUserName] = useState('User');
//   const [nutritionData, setNutritionData] = useState<NutritionData>({
//     calories: { consumed: 1300, goal: 2000 },
//     protein: { consumed: 45, goal: 60 },
//     carbs: { consumed: 150, goal: 250 },
//     fats: { consumed: 40, goal: 65 }
//   });

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <Image 
//             source={require('@/assets/images/logo.png')} 
//             style={styles.logo}
//             resizeMode="contain"
//           />
//           <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
//             <FontAwesome name="user-circle" size={30} color="#fff" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.searchContainer}>
//           <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search recipes, nutrition info..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>
//       </View>

//       {/* Hero Section */}
//       <View style={styles.heroSection}>
//         <ThemedText type="title">{`${getGreeting()}, ${userName}!`}</ThemedText>
//         <Text style={styles.heroText}>
//           Let's make your nutrition journey successful and affordable.
//         </Text>
//         <TouchableOpacity 
//           style={styles.heroCTA}
//           onPress={() => router.push('/(tabs)/meal-plan')}>
//           <Text style={styles.heroButtonText}>Generate My Meal Plan</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Nutritional Overview */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <ThemedText type="subtitle">Nutritional Overview</ThemedText>
//           <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition-details')}>
//             <Text style={styles.seeAll}>See All</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.statsGrid}>
//           <View style={styles.statCard}>
//             <Text style={styles.statLabel}>Daily Calories</Text>
//             <Text style={styles.statValue}>
//               {nutritionData.calories.consumed}/{nutritionData.calories.goal}
//             </Text>
//             <View style={styles.progressBar}>
//               <View 
//                 style={[
//                   styles.progressFill, 
//                   { width: `${(nutritionData.calories.consumed/nutritionData.calories.goal) * 100}%` }
//                 ]} 
//               />
//             </View>
//           </View>
//           <View style={styles.macroStats}>
//             <MacroCard 
//               title="Protein" 
//               current={nutritionData.protein.consumed} 
//               goal={nutritionData.protein.goal} 
//             />
//             <MacroCard 
//               title="Carbs" 
//               current={nutritionData.carbs.consumed} 
//               goal={nutritionData.carbs.goal} 
//             />
//             <MacroCard 
//               title="Fats" 
//               current={nutritionData.fats.consumed} 
//               goal={nutritionData.fats.goal} 
//             />
//           </View>
//         </View>
//       </View>

//       {/* Today's Meal Plan */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <ThemedText type="subtitle">Today's Meal Plan</ThemedText>
//           <TouchableOpacity onPress={() => router.push('/(tabs)/meal-plan')}>
//             <Text style={styles.seeAll}>View Full Plan</Text>
//           </TouchableOpacity>
//         </View>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <MealCard 
//             mealType="Breakfast"
//             title="Oatmeal with Fruits"
//             calories={350}
//             time="8:00 AM"
//           />
//           <MealCard 
//             mealType="Lunch"
//             title="Vegetable Rice Bowl"
//             calories={450}
//             time="1:00 PM"
//           />
//           <MealCard 
//             mealType="Dinner"
//             title="Grilled Chicken Salad"
//             calories={400}
//             time="7:00 PM"
//           />
//         </ScrollView>
//       </View>

//       {/* Government Schemes */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <ThemedText type="subtitle">Available Schemes</ThemedText>
//           <TouchableOpacity onPress={() => router.push('/(tabs)/schemes')}>
//             <Text style={styles.seeAll}>View All</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.schemeCard}>
//           <FontAwesome name="bell" size={24} color={Colors.light.tint} />
//           <View style={styles.schemeInfo}>
//             <Text style={styles.schemeTitle}>New Nutrition Support Scheme</Text>
//             <Text style={styles.schemeDescription}>
//               You may be eligible for monthly nutrition supplements.
//             </Text>
//           </View>
//           <TouchableOpacity style={styles.schemeButton}>
//             <Text style={styles.schemeButtonText}>Check</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Community Recipes */}
//       <View style={styles.section}>
//         <View style={styles.sectionHeader}>
//           <ThemedText type="subtitle">Community Recipes</ThemedText>
//           <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')}>
//             <Text style={styles.seeAll}>Browse All</Text>
//           </TouchableOpacity>
//         </View>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <RecipeCard 
//             title="Budget-Friendly Dal"
//             author="Priya M."
//             rating={4.5}
//             time="30 min"
//           />
//           <RecipeCard 
//             title="Nutritious Khichdi"
//             author="Rahul S."
//             rating={4.8}
//             time="25 min"
//           />
//         </ScrollView>
//       </View>
//     </ScrollView>
//   );
// }

// // Component for Macro Nutrient Cards
// const MacroCard: React.FC<MacroCardProps> = ({ title, current, goal }) => (
//   <View style={styles.macroCard}>
//     <Text style={styles.macroTitle}>{title}</Text>
//     <Text style={styles.macroValue}>{current}g/{goal}g</Text>
//     <View style={styles.progressBar}>
//       <View 
//         style={[
//           styles.progressFill, 
//           { width: `${(current/goal) * 100}%` }
//         ]} 
//       />
//     </View>
//   </View>
// );

// // Component for Meal Cards
// const MealCard: React.FC<MealCardProps> = ({ mealType, title, calories, time }) => (
//   <View style={styles.mealCard}>
//     <Text style={styles.mealType}>{mealType}</Text>
//     <Text style={styles.mealTitle}>{title}</Text>
//     <Text style={styles.mealInfo}>{calories} cal · {time}</Text>
//   </View>
// );

// // Component for Recipe Cards
// const RecipeCard: React.FC<RecipeCardProps> = ({ title, author, rating, time }) => (
//   <View style={styles.recipeCard}>
//     <View style={styles.recipeImagePlaceholder} />
//     <Text style={styles.recipeTitle}>{title}</Text>
//     <Text style={styles.recipeInfo}>By {author}</Text>
//     <View style={styles.recipeStats}>
//       <Text style={styles.recipeStat}>⭐ {rating}</Text>
//       <Text style={styles.recipeStat}>⏰ {time}</Text>
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     backgroundColor: Colors.light.tint,
//     padding: 20,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//   },
//   headerTop: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   logo: {
//     width: 120,
//     height: 40,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//   },
//   searchIcon: {
//     marginRight: 10,
//   },
//   searchInput: {
//     flex: 1,
//     height: 40,
//     fontSize: 16,
//   },
//   heroSection: {
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   heroText: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 5,
//     marginBottom: 15,
//   },
//   heroCTA: {
//     backgroundColor: Colors.light.tint,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   heroButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   section: {
//     padding: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   seeAll: {
//     color: Colors.light.tint,
//     fontSize: 14,
//   },
//   statsGrid: {
//     gap: 15,
//   },
//   statCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 8,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   statValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginVertical: 5,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: Colors.light.tint,
//   },
//   macroStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 10,
//   },
//   macroCard: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 10,
//     borderRadius: 8,
//   },
//   macroTitle: {
//     fontSize: 12,
//     color: '#666',
//   },
//   macroValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginVertical: 5,
//   },
//   mealCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 8,
//     marginRight: 15,
//     width: 200,
//   },
//   mealType: {
//     fontSize: 12,
//     color: Colors.light.tint,
//     fontWeight: 'bold',
//   },
//   mealTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginVertical: 5,
//   },
//   mealInfo: {
//     fontSize: 12,
//     color: '#666',
//   },
//   schemeCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 8,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   schemeInfo: {
//     flex: 1,
//   },
//   schemeTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   schemeDescription: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 5,
//   },
//   schemeButton: {
//     backgroundColor: Colors.light.tint,
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   schemeButtonText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   recipeCard: {
//     backgroundColor: '#f5f5f5',
//     padding: 15,
//     borderRadius: 8,
//     marginRight: 15,
//     width: 200,
//   },
//   recipeImagePlaceholder: {
//     backgroundColor: '#e0e0e0',
//     height: 120,
//     borderRadius: 6,
//     marginBottom: 10,
//   },
//   recipeTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   recipeInfo: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 5,
//   },
//   recipeStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   recipeStat: {
//     fontSize: 12,
//     color: '#666',
//   },
// });
