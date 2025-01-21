import dayjs from "dayjs";
import * as FileSystem from "expo-file-system";

const calculateMonthlyOccurrencesForAllThemes = async (fileUri, selectedThemes) => {
    try {
        // Lire et analyser le fichier JSON
        const jsonData = await FileSystem.readAsStringAsync(fileUri);
        const articles = JSON.parse(jsonData);

        const monthlyOccurrences = {};

        // Initialiser toutes les clés mensuelles pour les 3 dernières années
        const currentDate = dayjs();
        const startDate = dayjs().subtract(3, "year");
        let tempDate = startDate.startOf("month");

        while (tempDate.isBefore(currentDate)) {
            const monthKey = tempDate.format("YYYY-MM");
            monthlyOccurrences[monthKey] = 0; // Initialiser à zéro
            tempDate = tempDate.add(1, "month");
        }

        // Calculer les occurrences pour les articles contenant tous les thèmes
        articles.forEach((article) => {
            const publishedDate = dayjs(article.published_date || article.publishedAt);
            const monthKey = publishedDate.format("YYYY-MM");

            if (monthlyOccurrences[monthKey] !== undefined) {
                const title = article.title ? article.title.toLowerCase() : "";
                const allThemesPresent = selectedThemes.every((theme) =>
                    title.includes(theme.toLowerCase())
                );

                if (allThemesPresent) {
                    monthlyOccurrences[monthKey]++;
                }
            }
        });

        return monthlyOccurrences;
    } catch (error) {
        console.error("Error reading or processing the JSON file:", error);
        return {};
    }
};
