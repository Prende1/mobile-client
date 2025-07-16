import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';

const QuizResults = () => {
    const router = useRouter();
    const { quizScore } = useSelector((state) => state.quizScore);
    console.log('Quiz Score:', quizScore);

    // Calculate statistics from quizScore data
    const calculateStats = () => {
        if (!quizScore) {
            return {
                overallScore: 0,
                questionsAnswered: 0,
                totalQuestions: 0,
                timeTaken: '0 minutes 0 seconds',
                correctAnswers: 0,
                averageResponseTime: '0 seconds per question'
            };
        }

        const { correct, totalQuestions, startedTS, endTS } = quizScore;
        
        // Calculate overall score percentage
        const overallScore = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
        
        // Calculate time taken
        const startTime = new Date(startedTS);
        const endTime = new Date(endTS);
        const timeDifferenceMs = endTime - startTime;
        const timeDifferenceSeconds = Math.floor(timeDifferenceMs / 1000);
        const minutes = Math.floor(timeDifferenceSeconds / 60);
        const seconds = timeDifferenceSeconds % 60;
        const timeTaken = `${minutes} minutes ${seconds} seconds`;
        
        // Calculate average response time
        const averageSeconds = totalQuestions > 0 ? Math.round(timeDifferenceSeconds / totalQuestions) : 0;
        const averageResponseTime = `${averageSeconds} seconds per question`;

        return {
            overallScore,
            questionsAnswered: totalQuestions,
            totalQuestions,
            timeTaken,
            correctAnswers: correct,
            averageResponseTime
        };
    };

    // Get color and performance level based on score
    const getScoreColor = (score) => {
        if (score >= 90) return '#2e7d32'; // Dark green for excellent (90-100%)
        if (score >= 80) return '#388e3c'; // Green for very good (80-89%)
        if (score >= 70) return '#66bb6a'; // Light green for good (70-79%)
        if (score >= 60) return '#ffb74d'; // Orange for average (60-69%)
        if (score >= 50) return '#ff8a65'; // Light red for below average (50-59%)
        if (score >= 40) return '#f44336'; // Red for poor (40-49%)
        return '#d32f2f'; // Dark red for very poor (0-39%)
    };

    const getPerformanceLevel = (score) => {
        if (score >= 90) return 'Excellent!';
        if (score >= 80) return 'Very Good!';
        if (score >= 70) return 'Good!';
        if (score >= 60) return 'Average';
        if (score >= 50) return 'Below Average';
        if (score >= 40) return 'Poor';
        return 'Needs Improvement';
    };

    const stats = calculateStats();

    const handleGoHome = () => {
        // Navigate to home screen
        console.log('Navigate to home');
        router.replace('/(tabs)'); // Adjust the path as per your routing structure
    };

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz Results</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Result Message */}
                <View style={styles.messageSection}>
                    <Text style={styles.mainTitle}>Quiz Complete!</Text>
                    <Text style={styles.description}>
                        You have successfully completed the quiz. Here are your overall performance statistics across all questions.
                    </Text>
                </View>

                {/* Statistics */}
                <View style={styles.statisticsSection}>
                    <Text style={styles.statisticsTitle}>Statistics</Text>
                    
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Overall Score</Text>
                        <Text style={[styles.statValue, { color: getScoreColor(stats.overallScore) }]}>
                            {stats.overallScore}%
                        </Text>
                        <Text style={[styles.performanceText, { color: getScoreColor(stats.overallScore) }]}>
                            {getPerformanceLevel(stats.overallScore)}
                        </Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Questions Answered</Text>
                        <Text style={styles.statText}>{stats.questionsAnswered} out of {stats.totalQuestions}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Time Taken</Text>
                        <Text style={styles.statText}>{stats.timeTaken}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Correct Answers</Text>
                        <Text style={styles.statText}>{stats.correctAnswers} out of {stats.questionsAnswered}</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Average Response Time</Text>
                        <Text style={styles.statText}>{stats.averageResponseTime}</Text>
                    </View>
                </View>

                {/* Go to Home Button */}
                <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
                    <Text style={styles.homeButtonText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 24,
        color: '#6c757d',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    messageSection: {
        marginBottom: 32,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#6c757d',
        lineHeight: 24,
    },
    statisticsSection: {
        marginBottom: 32,
    },
    statisticsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 24,
    },
    statItem: {
        marginBottom: 24,
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007bff',
    },
    statText: {
        fontSize: 16,
        color: '#6c757d',
    },
    performanceText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
    },
    homeButton: {
        backgroundColor: '#e3f2fd',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1976d2',
    },
});

export default QuizResults;