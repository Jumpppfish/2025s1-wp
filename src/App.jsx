import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // ✅ 导入 Firestore 数据库
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const groups = {
  "⭕": "圆形组",
  "🔺": "三角组",
  "⬛": "方形组",
  "❌": "X型组",
};

export default function App() {
  const [players, setPlayers] = useState({}); // 存储玩家信息
  const [groupScores, setGroupScores] = useState({
    "⭕": 0,
    "🔺": 0,
    "⬛": 0,
    "❌": 0,
  });
  const [signInPlayer, setSignInPlayer] = useState({ number: "", group: "⭕" });
  const [scoreNumber, setScoreNumber] = useState("");
  const [points, setPoints] = useState("");

  // 📌 从 Firestore 加载玩家数据
  useEffect(() => {
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "players"));
      let loadedPlayers = {};
      let updatedGroupScores = { "⭕": 0, "🔺": 0, "⬛": 0, "❌": 0 };

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedPlayers[data.number] = { ...data, id: doc.id };
        updatedGroupScores[data.group] += data.score;
      });

      setPlayers(loadedPlayers);
      setGroupScores(updatedGroupScores);
    };

    fetchPlayers();
  }, []);

  // 📌 签到功能
  const handleSignIn = async () => {
    if (!signInPlayer.number) return alert("请输入号码！");

    const playerNumber = signInPlayer.number;
    const playerGroup = signInPlayer.group;

    if (players[playerNumber]) {
      return alert("该玩家已签到！");
    }

    try {
      const docRef = await addDoc(collection(db, "players"), {
        number: playerNumber,
        group: playerGroup,
        score: 0,
      });

      const updatedPlayers = { ...players };
      updatedPlayers[playerNumber] = {
        number: playerNumber,
        group: playerGroup,
        score: 0,
        id: docRef.id,
      };

      setPlayers(updatedPlayers);
      setSignInPlayer({ number: "", group: "⭕" });
    } catch (error) {
      console.error("Error adding player: ", error);
    }
  };

  // 📌 加减分功能
  const handleAddScore = async () => {
    if (!scoreNumber || isNaN(points)) return alert("请输入正确的号码和分数！");

    const playerNumber = scoreNumber;
    const scoreValue = parseInt(points);

    if (!players[playerNumber]) return alert("该玩家未签到！");

    try {
      const playerId = players[playerNumber].id;
      const playerDocRef = doc(db, "players", playerId);

      // 更新 Firestore 中的玩家分数
      await updateDoc(playerDocRef, {
        score: players[playerNumber].score + scoreValue,
      });

      // 更新本地状态
      const updatedPlayers = { ...players };
      updatedPlayers[playerNumber].score += scoreValue;

      const playerGroup = updatedPlayers[playerNumber].group;
      const updatedGroupScores = { ...groupScores };
      updatedGroupScores[playerGroup] += scoreValue;

      setPlayers(updatedPlayers);
      setGroupScores(updatedGroupScores);
      setScoreNumber("");
      setPoints("");
    } catch (error) {
      console.error("Error updating score: ", error);
    }
  };

  // 📊 排序后的个人积分榜
  const sortedPlayers = Object.values(players).sort(
    (a, b) => b.score - a.score
  );

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>🎮 大逃杀之夜 - 积分系统</h1>

      {/* 📝 签到区域 */}
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid gray",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <h2>📝 玩家签到</h2>
        <input
          type="text"
          placeholder="输入号码"
          value={signInPlayer.number}
          onChange={(e) =>
            setSignInPlayer({ ...signInPlayer, number: e.target.value })
          }
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <select
          value={signInPlayer.group}
          onChange={(e) =>
            setSignInPlayer({ ...signInPlayer, group: e.target.value })
          }
          style={{ padding: "5px", marginRight: "10px" }}
        >
          {Object.keys(groups).map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol} {groups[symbol]}
            </option>
          ))}
        </select>
        <button
          onClick={handleSignIn}
          style={{
            padding: "5px 10px",
            backgroundColor: "green",
            color: "white",
          }}
        >
          ✔️ 签到
        </button>
      </div>

      {/* ➕➖ 加分区域 */}
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid gray",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <h2>➕➖ 积分操作</h2>
        <input
          type="text"
          placeholder="输入号码"
          value={scoreNumber}
          onChange={(e) => setScoreNumber(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="输入分数（可负）"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button
          onClick={handleAddScore}
          style={{
            padding: "5px 10px",
            backgroundColor: "blue",
            color: "white",
          }}
        >
          ✅ 记录积分
        </button>
      </div>

      {/* 🏅 个人积分榜（按积分排序） */}
      <h2>🏅 个人积分排行榜</h2>
      <table border="1" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>排名</th>
            <th>号码</th>
            <th>分组</th>
            <th>积分</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={player.number}>
              <td>{index + 1}</td>
              <td>{player.number}</td>
              <td>
                {player.group} {groups[player.group]}
              </td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📊 组总积分 */}
      <h2>📊 组总积分</h2>
      <table border="1" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>分组</th>
            <th>总分</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupScores).map((symbol) => (
            <tr key={symbol}>
              <td>
                {symbol} {groups[symbol]}
              </td>
              <td>{groupScores[symbol]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
