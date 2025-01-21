const getColorForValue = (value) => {
  if (value === 0) return "#E0F7FA"; // Bleu clair
  if (value < 5) return "#80DEEA";
  if (value < 10) return "#00BCD4";
  if (value < 20) return "#00838F";
  return "#004D40"; // Bleu profond
};

const Heatmap = ({ data }) => {
  const months = Object.keys(data).sort(); // Triez par date

  return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", margin: 10 }}>
          {months.map((month) => (
              <View
                  key={month}
                  style={{
                      width: "30%",
                      height: 40,
                      backgroundColor: getColorForValue(data[month]),
                      margin: 2,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 5,
                  }}
              >
                  <Text style={{ color: "#FFF", fontSize: 12 }}>
                      {month}: {data[month]}
                  </Text>
              </View>
          ))}
      </View>
  );
};

export default Heatmap;
