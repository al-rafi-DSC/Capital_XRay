# Hướng dẫn thuyết trình Capital X Ray bằng tiếng Việt

Tài liệu dành cho người giới thiệu và thao tác demo trong khoảng 5 phút. Phần đầu là lời thoại để luyện nói; các phần sau giải thích màn hình, dữ liệu, AI và câu hỏi thường gặp. Các con số được đối chiếu với mã nguồn và dữ liệu xuất sẵn của ứng dụng ngày 8 tháng 9 năm 2026.

**Thông điệp cần nhớ:** Capital X-Ray giúp ngân hàng, quỹ đầu tư và cơ quan quản lý nhận diện những địa bàn và ngành có dấu hiệu lệch pha giữa hoạt động kinh tế và tín dụng, từ đó chọn nơi cần tìm hiểu sâu hơn.

## 1 Kịch bản nói trong khoảng 5 phút

Chỉ đọc các đoạn trong dấu ngoặc kép. Các dòng **Thao tác** là hướng dẫn điều khiển màn hình. Thời gian dưới đây là mốc luyện tập dự kiến, đã dành chỗ cho thao tác; nên bấm giờ một lần trước khi trình bày.

### 0 đến 40 giây Giới thiệu vấn đề

**Thao tác:** Hiển thị phần đầu trang có tên CAPITAL X-RAY và bảng LOMBARDY MACRO INDEX.

“Xin chào mọi người. Nhóm mình xây dựng Capital X-Ray để trả lời một câu hỏi: dòng vốn ngân hàng có đang theo kịp hoạt động kinh tế của từng địa phương và ngành hay không?

Thông tin về doanh nghiệp và thông tin về tín dụng thường nằm ở những bộ dữ liệu riêng. Chúng mình kết hợp hai phía để giúp ngân hàng, quỹ đầu tư và cơ quan quản lý nhận diện những nơi cần xem xét kỹ hơn.”

### 40 giây đến 1 phút 15 giây Giải thích dữ liệu

**Thao tác:** Chỉ vào số tỉnh, số ngành và giai đoạn 2015–2020 trong bảng tổng quan.

“Bản demo sử dụng dữ liệu tín dụng và tiền gửi của Banca d’Italia, kết hợp dữ liệu kinh tế doanh nghiệp của Istat. Phạm vi gồm năm tỉnh tại Lombardy, ba nhóm ngành là công nghiệp, xây dựng và dịch vụ.

Chúng mình có 15 tổ hợp tỉnh và ngành, mỗi tổ hợp được quan sát trong sáu năm, từ 2015 đến 2020. Đây là dữ liệu lịch sử dùng để chứng minh cách hoạt động của sản phẩm.”

### 1 phút 15 giây đến 2 phút 10 giây Trình bày ma trận

**Thao tác:** Cuộn xuống The Capital X-Ray Matrix. Giữ bộ lọc All và cách sắp xếp Most Underfinanced. Chọn thẻ **Brescia · Costruzioni**.

“Mỗi thẻ đại diện cho một ngành tại một tỉnh. Ứng dụng so sánh điểm động lực kinh tế với điểm hỗ trợ tài chính, trên thang tương đối từ 0 đến 100.

Ví dụ, ngành xây dựng tại Brescia có điểm kinh tế khoảng 68, trong khi hỗ trợ tài chính khoảng 40. Điểm chênh lệch mà hệ thống tính được là âm 27, nên thẻ được đánh dấu thiếu tài trợ theo phương pháp này.

Điểm âm nghĩa là hỗ trợ tài chính thấp hơn động lực kinh tế. Điểm dương nghĩa là hỗ trợ tài chính cao hơn. Đây là tín hiệu sàng lọc để đặt câu hỏi tiếp theo. Một điểm số 68 không có nghĩa là tăng trưởng 68 phần trăm.”

### 2 phút 10 giây đến 2 phút 50 giây Giới thiệu phần giải thích AI

**Thao tác:** Cuộn xuống Why is this highlighted. Kiểm tra tên Brescia — Costruzioni và nhãn GEMINI LIVE hoặc FALLBACK.

“Khi chọn một thẻ, phần này giải thích vì sao nó được đánh dấu. Gemini nhận các chỉ số đã tính sẵn và kết quả mô hình, rồi tạo phần diễn giải ngắn gọn.

Chúng mình yêu cầu AI sử dụng những con số được cung cấp và nhắc rõ các chỉ số liên quan. Sáu chỉ số thành phần ở bên dưới giúp người xem đối chiếu phần giải thích với dữ liệu. Nếu dịch vụ AI không trả về kết quả, ứng dụng có phần diễn giải theo mẫu.”

**Nếu nhãn là FALLBACK, nói thêm:** “Hiện tại màn hình đang dùng phần giải thích theo mẫu, không phải phản hồi Gemini trực tiếp.”

**Nếu AI còn tải:** Chuyển sang phần mô hình; không dành thời gian chờ hoặc bấm chạy lại nhiều lần.

### 2 phút 50 giây đến 3 phút 50 giây Giới thiệu mô hình học máy

**Thao tác:** Cuộn xuống Expected-Credit Benchmark. Chọn **Varese · Costruzioni** trong biểu đồ Learned Credit Gap ở bên phải.

“Bên cạnh cách tính điểm có trọng số, chúng mình huấn luyện một mô hình hồi quy từ 90 quan sát. Mô hình học mối liên hệ giữa dư nợ tín dụng với doanh thu, số cơ sở kinh doanh, ngành và thời gian.

Với xây dựng tại Varese, chênh lệch học được cho cả giai đoạn vào khoảng âm 27 phần trăm. Tổ hợp này được đánh dấu là có mức tín dụng thấp bất thường so với chuẩn tham chiếu của mô hình.

Khi kiểm tra bằng cách loại hoàn toàn một tổ hợp tỉnh và ngành khỏi dữ liệu huấn luyện, R bình phương đạt 0,92 trên thang log của dư nợ. Kết quả này đo mức độ phù hợp của dự đoán; mô hình chưa xác định được nơi nào chắc chắn xứng đáng nhận thêm vốn.”

### 3 phút 50 giây đến 4 phút 35 giây Demo phân bổ vốn

**Thao tác:** Cuộn xuống €1,000,000 Regional Capital Simulator. Chuyển từ **Underfinanced Areas** sang **Growth**, rồi sang **Diversification**. Có thể đổi Donut sang Bar nếu còn thời gian.

“Phần cuối cho phép thử phân bổ ngân sách giả định một triệu euro. Khi đổi mục tiêu, các tổ hợp được ưu tiên và tỷ trọng phân bổ cũng thay đổi.

Underfinanced Areas ưu tiên chênh lệch thiếu tài trợ; Growth ưu tiên động lực kinh tế. Diversification giới hạn mỗi tỉnh một vị trí trong danh mục được chọn.

Phân bổ này được tính bằng các quy tắc minh bạch dựa trên điểm số. Nó giúp người dùng so sánh các kịch bản, và không thực hiện giao dịch.”

### 4 phút 35 giây đến 5 phút Kết thúc

**Thao tác:** Giữ màn hình biểu đồ phân bổ.

“Giá trị của Capital X-Ray là đưa dữ liệu kinh tế và tín dụng lên cùng một màn hình, kèm cách so sánh, diễn giải AI và mô phỏng phân bổ vốn.

Với ngân hàng, quỹ đầu tư hoặc cơ quan quản lý, đây có thể là bước đầu để chọn địa bàn và ngành cần phân tích sâu hơn. Hướng phát triển tiếp theo là cập nhật dữ liệu, mở rộng phạm vi và bổ sung thông tin về nhu cầu vay cùng chất lượng tín dụng. Cảm ơn mọi người.”

## 2 Hiểu sản phẩm trước khi học lời thoại

### Người dùng và giá trị sử dụng

Ngân hàng có thể dùng ứng dụng để chọn thị trường cần khảo sát trước khi mở rộng hoạt động cho vay. Quỹ đầu tư có thể dùng nó để lập danh sách địa bàn hoặc ngành cần thẩm định. Cơ quan quản lý có thể so sánh các tín hiệu để nghiên cứu chương trình hỗ trợ phù hợp.

Ví dụ về câu hỏi của người dùng: “Ngành xây dựng ở Brescia có biến động kinh tế và tín dụng khác nhau như thế nào?” Ứng dụng đưa ra các chỉ số có thể đối chiếu, thay vì chỉ hiển thị một con số dư nợ đứng riêng.

Các kết quả hiện tại là tín hiệu ở cấp **tỉnh × ngành**. Một thẻ không đại diện cho một doanh nghiệp, một người vay hoặc một hồ sơ tín dụng cụ thể.

### Phạm vi dữ liệu thực tế

| Thành phần | Nội dung hiện tại |
|---|---|
| Năm tỉnh | Milano, Brescia, Bergamo, Monza e della Brianza, Varese |
| Ba ngành | Industria = công nghiệp; Costruzioni = xây dựng; Servizi = dịch vụ |
| Giai đoạn | 2015–2020, gồm sáu năm |
| Ma trận | 5 tỉnh × 3 ngành = 15 thẻ |
| Dữ liệu mô hình | 15 tổ hợp × 6 năm = 90 quan sát; không phải 90 doanh nghiệp độc lập |
| Tín dụng | Banca d’Italia STAFINRA, cube TFR20232 |
| Tiền gửi | Banca d’Italia STAFINRA, cube TFR20267 |
| Kinh tế doanh nghiệp | Istat Frame SBS territoriale, bảng tỉnh 2015–2020 |

Pipeline lấy số dư tín dụng và tiền gửi cuối năm, ghép với doanh thu, số cơ sở kinh doanh và số lao động của Istat. Các mã ngành được quy về ba nhóm lớn để hai nguồn có thể so sánh.

**Điểm cần nắm:** cột “businesses” hiện lấy số **cơ sở kinh doanh địa phương** của Istat, tức unità locali. Không nên diễn giải nó thành số doanh nghiệp mới thành lập. Dữ liệu tín dụng là dư nợ, không phải số khoản vay mới được duyệt trong năm.

Tiền gửi chỉ có cấp tỉnh, không tách theo ngành, và thuộc phạm vi người cư trú sau khi loại các tổ chức tài chính tiền tệ theo bộ lọc nguồn. Vì vậy, không gọi chỉ số này là tiền tiết kiệm riêng của doanh nghiệp thuộc ngành đang chọn.

Tài liệu ý tưởng ban đầu dự kiến dùng dữ liệu Lombardia cho phần kinh tế. Pipeline hiện tại dùng **Istat**. File Lombardia lưu trong dự án là dữ liệu phụ, không phải đầu vào chính của 15 thẻ đang trình bày.

## 3 Đọc từng phần của webapp

### Phần đầu trang và bảng tổng quan

LOMBARDY MACRO INDEX tóm tắt phạm vi và các cực trị của bộ dữ liệu. Dữ liệu xuất sẵn hiện có:

| Chỉ số | Giá trị |
|---|---:|
| Số tổ hợp bị đánh dấu thiếu tài trợ theo điểm có trọng số | 5 trên 15 |
| Số tổ hợp cân bằng theo điểm có trọng số | 5 trên 15 |
| Số tổ hợp có hỗ trợ tài chính vượt điểm kinh tế | 5 trên 15 |
| Điểm chênh lệch trung bình sau làm tròn | +2 điểm |
| Điểm âm lớn nhất | Brescia · Costruzioni, −27 |
| Điểm dương lớn nhất | Monza e della Brianza · Industria, +60 |

Trung bình gần 0 có thể che khuất những chênh lệch lớn giữa các tổ hợp. Đây là lý do cần ma trận chi tiết.

### The Capital X Ray Matrix

**Filter Province** lọc theo tỉnh. **Filter Sector** lọc theo ngành. **Sort Severity** thay đổi thứ tự hiển thị, gồm thiếu tài trợ nhiều nhất, thặng dư nhiều nhất, động lực kinh tế cao nhất, hỗ trợ tài chính thấp nhất và tên tỉnh. **Quick Search** tìm theo tên tỉnh hoặc ngành.

Các bộ lọc thay đổi các thẻ được hiển thị. Chúng không tính lại thang điểm, không thay đổi các số tổng quan cho toàn bộ 15 thẻ và không giới hạn tập dữ liệu của simulator. Nhấp một thẻ mới là thao tác chọn tổ hợp cho phần giải thích và mô hình bên dưới; có thể cần tự cuộn xuống.

| Nhãn trên thẻ | Cách hiểu |
|---|---|
| Economic Strength | Điểm động lực kinh tế tổng hợp |
| Business Momentum | Điểm tăng trưởng số cơ sở kinh doanh |
| Credit Support | Điểm hỗ trợ tài chính tổng hợp, gồm cả tín dụng và tiền gửi |
| Liquidity Index | Điểm tương đối của tỷ lệ tiền gửi cấp tỉnh trên dư nợ của ngành |
| Capital Gap Score | Điểm hỗ trợ tài chính trừ điểm động lực kinh tế |

Ứng dụng đang phân loại bằng các ngưỡng sau:

| Điểm chênh lệch | Màu và trạng thái | Cách giải thích |
|---|---|---|
| Từ −15 trở xuống | Hồng đỏ, Capital Deficit | Hỗ trợ tài chính thấp hơn động lực kinh tế theo công thức |
| Lớn hơn −15 và nhỏ hơn +15 | Xanh lá, Balanced | Chênh lệch nằm trong vùng cân bằng của quy tắc |
| Từ +15 trở lên | Xanh dương, Credit Surplus | Hỗ trợ tài chính cao hơn động lực kinh tế theo công thức |

Các ngưỡng ±15 là lựa chọn của prototype. “Balanced” không có nghĩa mọi doanh nghiệp đều đủ vốn; “Overheated” trên giao diện không chứng minh có bong bóng hoặc nguy cơ vỡ nợ.

### Why is this highlighted

Phần này đi theo thẻ đang được chọn. Nó gồm tiêu đề, nhận định, đoạn diễn giải, sáu điểm thành phần, các ý giải thích và đề xuất cần xem xét. Mismatch Vector đặt điểm kinh tế cạnh điểm tài chính để người xem đối chiếu nhanh.

**GEMINI LIVE** nghĩa là đã nhận được phần diễn giải từ Gemini. **FALLBACK** nghĩa là đang dùng nội dung được tạo theo mẫu trong ứng dụng. **Re-run AI Synthesis** yêu cầu tạo lại phần diễn giải cho cùng tổ hợp; thao tác này không huấn luyện lại hồi quy và không cập nhật dữ liệu nguồn.

Gemini được cung cấp các trường số liệu, tên tỉnh, ngành và kết quả benchmark. Prompt yêu cầu chỉ dùng con số có sẵn, nhắc ít nhất hai điểm thành phần và tránh suy diễn nguyên nhân. Đây là cơ chế hướng dẫn mô hình, chưa phải bộ kiểm chứng tự động đảm bảo mọi câu đều chính xác. Khi thuyết trình, ưu tiên đọc các điểm có thể đối chiếu ngay trên màn hình.

Trong lúc gọi AI, phần giải thích có thể hiện trạng thái tải. Nếu yêu cầu kết thúc với lỗi, ứng dụng sử dụng nội dung theo mẫu. Không hứa rằng AI luôn phản hồi ngay hoặc chắc chắn không bao giờ sai.

### Expected Credit Benchmark

Mô hình hồi quy ước lượng mức dư nợ phù hợp với quan hệ thống kê quan sát được trong bộ dữ liệu. Đầu vào gồm doanh thu, số cơ sở kinh doanh, nhóm ngành và xu hướng theo năm. Tỉnh xác định tổ hợp và nhóm kiểm định; mô hình không có biến riêng cho danh tính từng tỉnh.

**Model-expected credit** là mức dư nợ mô hình ước lượng. **Actual credit** là mức thực tế trong dữ liệu. Hai thanh này sử dụng năm cuối cùng, tức 2020. **Learned gap** là chênh lệch tổng hợp từ sai số log trung bình của cả giai đoạn sáu năm. Hai cách tổng hợp này có thể khác nhau cả về độ lớn lẫn dấu.

Biểu đồ Learned Credit Gap bên phải xếp hạng 15 tổ hợp. Thanh bên trái 0 là chênh lệch âm; bên phải 0 là chênh lệch dương. Nhấp tên một tổ hợp để đổi phần Selected Cell và yêu cầu phần giải thích tương ứng.

**Z-score** cho biết chênh lệch của tổ hợp lớn đến mức nào so với độ phân tán chênh lệch giữa 15 tổ hợp. Ứng dụng đánh dấu bất thường khi trị tuyệt đối z-score từ 1,5 trở lên. Đây là ngưỡng sàng lọc, không phải một kiểm định chứng minh nguyên nhân thiếu vốn.

### Regional Capital Simulator

Simulator xếp hạng 15 tổ hợp theo mục tiêu, chọn bốn vị trí và phân bổ ngân sách giả định theo trọng số. Đổi Donut sang Bar chỉ đổi cách vẽ biểu đồ. Ngân sách hiện cố định ở một triệu euro.

| Mục tiêu | Quy tắc chính | Vị trí đứng đầu trong dữ liệu hiện tại |
|---|---|---|
| Underfinanced Areas | Ưu tiên điểm chênh lệch có trọng số âm hơn | Brescia · Costruzioni |
| Growth | Ưu tiên động lực kinh tế, trừ một phần điểm hỗ trợ tài chính | Monza e della Brianza · Servizi |
| Low-Risk | Ưu tiên chỉ số tiền gửi và thanh khoản, giảm điểm khi chênh lệch lớn | Monza e della Brianza · Costruzioni |
| Diversification | Xếp hạng theo điểm, chọn tối đa một vị trí cho mỗi tỉnh | Monza e della Brianza · Servizi |

Diversification đảm bảo khác tỉnh trong bốn vị trí được chọn. Nó không đảm bảo đủ ba ngành, không chia đều cho cả năm tỉnh và không tối ưu theo tương quan lợi nhuận.

Simulator hiện dùng điểm có trọng số, không dùng chênh lệch của hồi quy để phân bổ. Đoạn mang nhãn “AI Allocation Strategy Rationale” được tạo bằng mẫu và quy tắc trong mã nguồn; không có cuộc gọi Gemini riêng cho phần phân bổ.

## 4 Hiểu các công thức vừa đủ để trả lời

### Điểm có trọng số

Pipeline tính tốc độ tăng trưởng kép hằng năm từ 2015 đến 2020, rồi chuẩn hóa từng chỉ tiêu trong tập 15 tổ hợp về thang 0–100. Giá trị thấp nhất nhận 0; cao nhất nhận 100. Nếu mọi giá trị bằng nhau, pipeline gán 50.

**Điểm kinh tế = 40% điểm tăng doanh thu + 30% điểm tăng số cơ sở kinh doanh + 30% điểm tăng lao động.**

**Điểm hỗ trợ tài chính = 50% điểm tăng dư nợ + 30% điểm tăng tiền gửi + 20% điểm thanh khoản.**

**Capital Gap Score = Điểm hỗ trợ tài chính − Điểm kinh tế.**

Sector Performance trong công thức hiện sử dụng tăng trưởng lao động. Liquidity sử dụng tỷ lệ tiền gửi toàn tỉnh trên dư nợ của ngành trong năm cuối, sau đó chuẩn hóa; nó không trực tiếp đo khả năng trả nợ hay dòng tiền của doanh nghiệp.

Các trọng số do nhóm lựa chọn cho prototype, không được học tự động từ dữ liệu. Điểm được tính bằng số chưa làm tròn rồi mới xuất ra giao diện. Vì vậy, Brescia có hai điểm hiển thị 68 và 40 nhưng gap là −27; trừ hai số đã làm tròn có thể lệch một điểm.

Ví dụ giúp phân biệt điểm với phần trăm: Brescia · Costruzioni có điểm Turnover Growth là 99 và Credit Growth là 0. Trong dữ liệu gốc đã xuất, tốc độ tăng trưởng kép tương ứng là khoảng **+12,32%/năm** và **−18,00%/năm**. Không đọc thành “doanh thu tăng 99% và tín dụng tăng 0%”.

### Hồi quy và kiểm định

Công thức kỹ thuật là `log(dư nợ) ~ log(doanh thu) + log(số cơ sở kinh doanh) + ngành + xu hướng năm`. Dùng log giúp biểu diễn mối quan hệ theo tỷ lệ và làm việc với các quy mô kinh tế rất khác nhau. Các hệ số trong Learned Coefficients là những hệ số mô hình học được, không phải quan hệ nhân quả.

Kiểm định **leave-one-cell-out** lần lượt bỏ toàn bộ sáu năm của một tổ hợp tỉnh và ngành, huấn luyện bằng các tổ hợp còn lại, rồi dự đoán tổ hợp bị bỏ ra. Như vậy, mô hình được kiểm tra trên tổ hợp chưa có trong lần huấn luyện đó. Đây chưa phải kiểm định dự báo các năm tương lai.

| Chỉ số trong artifact | Giá trị | Cách giải thích |
|---|---:|---|
| Leave-one-cell-out R² | 0,920 | Mức độ giải thích biến thiên của log dư nợ trong phép kiểm định giữ lại từng tổ hợp |
| Size-stripped R² | 0,865, giao diện làm tròn 0,86 | Phép kiểm tra bổ sung với log dư nợ trên mỗi cơ sở kinh doanh |
| Sector-only baseline | −0,109, giao diện làm tròn −0,11 | Mô hình chỉ dùng ngành hoạt động kém hơn mức dự đoán trung bình theo cách tính R² này |
| Typical Error | 23,7%, giao diện khoảng ±24% | Quy đổi từ độ lệch chuẩn sai số trên tập được fit; không phải khoảng dự báo 95% hoặc sai số ngoài mẫu |
| Tương quan với điểm có trọng số | −0,123 | Hai thước đo có tương quan tuyến tính yếu trong tập hiện tại |

R² = 0,92 **không có nghĩa “AI chính xác 92%”** và không phải xác suất hoàn vốn. Các chênh lệch hiển thị cho từng tổ hợp được tính từ mô hình fit trên toàn bộ 90 dòng; chúng khác với các dự đoán giữ lại từng tổ hợp dùng để tính R² kiểm định.

### Ví dụ Varese cần giải thích đúng

| Số liệu Varese · Costruzioni | Giá trị |
|---|---:|
| Điểm có trọng số | −7, nằm trong vùng Balanced |
| Learned gap tổng hợp 2015–2020 | −27,1% |
| Z-score | −1,91 |
| Kết luận theo ngưỡng mô hình | UNDERFINANCED, tổ hợp duy nhất được đánh dấu bất thường trong artifact hiện tại |
| Dư nợ thực tế năm 2020 | Khoảng 716,5 triệu euro |
| Dư nợ mô hình ước lượng năm 2020 | Khoảng 1.203,1 triệu euro, tức 1,203 tỷ euro |

Cách nói gọn: “Trong toàn giai đoạn, Varese xây dựng có chênh lệch tín dụng học được khoảng âm 27%. Riêng hai thanh bên trên so sánh số thực tế và ước lượng của năm 2020.”

Không lấy 716,5 chia 1.203,1 rồi nói kết quả phải bằng −27,1%. Riêng phép so sánh năm 2020 cho mức chênh khoảng −40,4%; −27,1% được tổng hợp theo sai số log của cả sáu năm.

Hai phương pháp có thể khác nhau: điểm có trọng số chủ yếu so sánh diễn biến tăng trưởng và điều kiện tài chính tương đối; hồi quy so sánh mức dư nợ với chuẩn tham chiếu thống kê. Varese là ví dụ cho việc một tổ hợp có thể nằm trong vùng Balanced của cách thứ nhất nhưng bị đánh dấu trong cách thứ hai.

## 5 Những câu hỏi giám khảo có thể đặt ra

**Ứng dụng này khác một dashboard thông thường ở đâu?**

“Chúng mình ghép tín dụng và kinh tế theo cùng tỉnh, ngành và thời gian; tạo hai góc nhìn về chênh lệch; thêm diễn giải AI và cho phép đổi mục tiêu phân bổ để xem kết quả thay đổi.”

**AI thực sự nằm ở phần nào?**

“Có hồi quy được huấn luyện trên dữ liệu và Gemini tạo phần diễn giải. Simulator là thuật toán theo quy tắc. Ba phần có vai trò khác nhau.”

**Tại sao dùng hồi quy tuyến tính?**

“Quy mô dữ liệu hiện nhỏ. Hồi quy là một lựa chọn dễ giải thích, có thể hiển thị hệ số và kiểm tra với một baseline đơn giản. Chúng mình chưa khẳng định đây là mô hình tốt nhất cho triển khai thực tế.”

**Có phải đang dự đoán nơi đầu tư sinh lời cao nhất không?**

“Mô hình ước lượng mức dư nợ dựa trên dữ liệu lịch sử. Ứng dụng chưa huấn luyện mô hình dự báo lợi nhuận hoặc vỡ nợ.”

**Tại sao một nơi được gắn nhãn thiếu tài trợ?**

“Ở ma trận, vì chênh lệch có trọng số đi qua ngưỡng −15. Ở benchmark, vì chênh lệch âm có z-score đi qua ngưỡng −1,5. Khi giải thích, chúng mình nói rõ đang dùng thước đo nào.”

**Thiếu tài trợ có chứng minh ngân hàng phân bổ sai không?**

“Chưa. Dữ liệu chưa quan sát đầy đủ nhu cầu vay, rủi ro, tài sản đảm bảo và chất lượng khoản vay. Tín hiệu giúp chọn nơi cần khảo sát, sau đó người dùng thực hiện thẩm định.”

**Dữ liệu có cập nhật trực tiếp không?**

“Bản hiện tại sử dụng dữ liệu lịch sử đã xử lý và xuất sẵn. Chưa có cơ chế cập nhật dữ liệu kinh tế trực tiếp. Chỉ phần diễn giải Gemini có thể được tạo khi người dùng tương tác.”

**Có thể dùng cho tỉnh hoặc ngành khác không?**

“Có thể mở rộng pipeline khi có dữ liệu tương thích. Tuy nhiên, thêm tỉnh hoặc ngành sẽ thay đổi tập chuẩn hóa, nên cần tính lại điểm và huấn luyện, kiểm định lại mô hình.”

**Có tự động duyệt khoản vay hay chuyển một triệu euro không?**

“Không có chức năng đó trong bản hiện tại. Một triệu euro là ngân sách giả định để so sánh kịch bản.”

**Các nguồn dữ liệu có hạn chế gì?**

“Đây là dữ liệu tổng hợp cấp tỉnh và ngành trong sáu năm lịch sử. Tiền gửi không tách theo ngành; bộ dữ liệu nhỏ và còn thiếu nhu cầu vay cùng chất lượng tín dụng. Các yếu tố này giới hạn cách diễn giải kết quả.”

**Nếu mất kết nối AI thì sao?**

“Ứng dụng có phần giải thích theo mẫu. Điểm số, kết quả hồi quy và phân bổ theo quy tắc đã có sẵn. Dự án cũng có một bản HTML offline cơ bản để dự phòng, với phạm vi tính năng nhỏ hơn bản Next.js.”

**Nhóm sẽ phát triển tiếp thế nào?**

“Ưu tiên cập nhật giai đoạn dữ liệu, mở rộng số tỉnh và ngành, cải thiện tương thích giữa nguồn, thử độ nhạy của trọng số và kiểm định trên dữ liệu mới. Khi có dữ liệu phù hợp, bổ sung nhu cầu vay cùng chất lượng tín dụng.”

## 6 Những nhãn cần diễn giải cẩn thận khi demo

Đây là ghi chú để người thuyết trình dùng đúng ngôn ngữ với phiên bản hiện tại. Các khác biệt dưới đây được xác nhận từ mã nguồn; không cần đọc toàn bộ phần này trên sân khấu.

| Nội dung đang xuất hiện | Cách trình bày phù hợp |
|---|---|
| Live Feed ở đầu trang | Nói “bản demo dùng dữ liệu lịch sử 2015–2020” |
| Turnover +99% hoặc Credit +0% ở cuối thẻ | Đây đang là điểm chuẩn hóa bị gắn dấu %; dùng khu vực 0–100 để giải thích |
| Corporate savings | Tiền gửi hiện ở cấp tỉnh với phạm vi rộng hơn doanh nghiệp trong ngành |
| Cash conversion hoặc Liquidity | Chỉ số thay thế từ tiền gửi cấp tỉnh chia dư nợ ngành, không phải đo dòng tiền thực tế |
| Target Yield | Giá trị minh họa tính từ điểm, không phải dự báo lợi nhuận được kiểm định |
| Risk Low hoặc Medium | Nhãn theo ngưỡng Liquidity Index, không phải xếp hạng tín dụng đã kiểm định |
| Optimal capital deployment | Nói “phân bổ theo mục tiêu và quy tắc”; chưa có chứng minh tối ưu hóa danh mục |
| AI Allocation Strategy Rationale | Diễn giải theo mẫu của simulator, không phải Gemini đang quyết định phân bổ |
| ±24% Typical Error | Chỉ số sai số trong mẫu được quy đổi, không phải cam kết sai số hay khoảng tin cậy |
| Thanh actual và expected cùng Learned gap | Hai thanh là năm 2020; learned gap là tổng hợp 2015–2020 |
| 100% Budget | Mục tiêu là 1 triệu euro; số tiền từng vị trí và tỷ trọng được làm tròn độc lập |
| ISTAT/ABI Proxy ở chân trang | Nguồn pipeline hiện là Istat và Banca d’Italia |

Do làm tròn độc lập, tổng tiền hiển thị hiện là 999.000 euro ở Underfinanced Areas, 1.001.000 ở Growth, 1.000.000 ở Low-Risk và 999.000 ở Diversification. Tỷ trọng Low-Risk cộng lại là 101%. Nếu được hỏi, giải thích đây là sai lệch làm tròn của prototype, chưa có bước cân chỉnh số hiển thị về ngân sách chính xác.

Một số câu diễn giải theo mẫu hoặc nội dung quảng bá trên giao diện có thể nêu nguyên nhân mạnh hơn điều dữ liệu chứng minh. Người trình bày nên dùng cách nói “điểm số cho thấy chênh lệch” thay vì khẳng định ngân hàng từ chối cho vay, doanh nghiệp bắt buộc tự tài trợ, hoặc chắc chắn có lợi nhuận cao.

## 7 Kiến trúc để trả lời câu hỏi kỹ thuật

Luồng chính: **Dữ liệu nguồn → Python xử lý và ghép dữ liệu → điểm số và mô hình → file JSON cùng TypeScript → giao diện Next.js → Gemini diễn giải khi có yêu cầu.**

| Thành phần | Công việc |
|---|---|
| Python, pandas, openpyxl | Đọc dữ liệu, đối chiếu ngành, ghép tỉnh và năm, tính tăng trưởng và điểm |
| scikit-learn LinearRegression | Huấn luyện mô hình mức dư nợ và chạy kiểm định giữ lại từng tổ hợp |
| Next.js, React, TypeScript | Hiển thị ứng dụng và quản lý lựa chọn của người dùng |
| Tailwind CSS, Recharts | Định dạng giao diện và vẽ biểu đồ |
| POST /api/explain | Gọi Gemini phía máy chủ và trả phần giải thích có cấu trúc |
| Dữ liệu xuất sẵn | Cho phép dùng điểm và kết quả mô hình mà không huấn luyện lại khi bấm thẻ |

Khóa Gemini được đọc phía máy chủ từ biến môi trường. Backend của bản hiện tại là API route trong Next.js; không có Flask hoặc FastAPI riêng trong luồng đã xem. Dữ liệu ứng dụng được xuất thành file; không cần cơ sở dữ liệu cho bản demo này.

Các file cần biết nếu thành viên kỹ thuật được hỏi:

- `pipeline/build_dataset.py`: tạo `web/data.json` và `capital-x-ray/lib/capital-data.ts`.
- `pipeline/train_model.py`: tạo `web/model.json` và `capital-x-ray/lib/capital-model.ts`.
- `capital-x-ray/app/page.tsx`: giao diện, bộ lọc, lựa chọn thẻ, phần giải thích theo mẫu và simulator.
- `capital-x-ray/app/api/explain/route.ts`: gọi Gemini và thử mô hình thay thế khi có lỗi.
- `pipeline/build_standalone.py`: tạo `web/capital-x-ray.html`, bản offline cơ bản có ma trận, giải thích theo mẫu và simulator; không có phần hồi quy và Gemini trực tiếp như bản chính.

## 8 Các bước chuẩn bị trước khi lên trình bày

1. Mở bản Next.js đã chuẩn bị của nhóm. Nếu chạy cục bộ, thành viên kỹ thuật vào thư mục `capital-x-ray` và dùng `npm run dev`; lấy địa chỉ từ terminal.
2. Kiểm tra cả năm phần: tổng quan, ma trận, giải thích, Expected-Credit Benchmark và simulator. Bản HTML offline không có đủ phần mô hình như bản chính.
3. Chọn Brescia · Costruzioni trước để thử phần giải thích. Xem nhãn GEMINI LIVE hay FALLBACK và chuẩn bị câu nói tương ứng.
4. Luyện cuộn đến mô hình rồi chọn Varese · Costruzioni. Nhớ cặp số −27,1% và z = −1,91.
5. Thử ba nút Underfinanced Areas, Growth và Diversification. Không cần đọc hết bốn khoản phân bổ.
6. Đưa màn hình về phần đầu trang, để các bộ lọc ở All. Lưu ý thẻ mặc định khi mới mở là Milano · Industria; hãy chủ động chọn Brescia khi đến bước demo.
7. Bấm giờ luyện một lần. Nếu vượt 5 phút, bỏ thao tác đổi Donut sang Bar và không đọc hệ số hoặc toàn bộ chỉ số kiểm định.

**Sáu ý để nhớ khi không nhìn tài liệu:** vấn đề dữ liệu tách rời; 5 tỉnh × 3 ngành × 6 năm; điểm âm là thiếu tài trợ theo công thức; hồi quy tạo chuẩn tham chiếu tín dụng; Gemini diễn giải; simulator đổi phân bổ theo mục tiêu.

## 9 Bảng tra nhanh của 15 tổ hợp

“Gap điểm” là Capital Gap Score. “Gap mô hình” là chênh lệch tổng hợp từ hồi quy trong sáu năm. Hai cột không cùng đơn vị và không cần trùng dấu.

| Tỉnh và ngành | Điểm kinh tế | Điểm tài chính | Gap điểm | Gap mô hình |
|---|---:|---:|---:|---:|
| Brescia · Costruzioni | 68 | 40 | −27 | +17,9% |
| Milano · Costruzioni | 78 | 53 | −25 | +27,2% |
| Monza e della Brianza · Servizi | 87 | 64 | −24 | +7,5% |
| Bergamo · Costruzioni | 55 | 37 | −18 | −16,6% |
| Bergamo · Servizi | 69 | 52 | −17 | +18,4% |
| Milano · Servizi | 72 | 59 | −13 | −20,2% |
| Varese · Servizi | 51 | 40 | −11 | −13,8% |
| Varese · Costruzioni | 38 | 31 | −7 | −27,1% |
| Brescia · Servizi | 64 | 60 | −4 | +14,2% |
| Monza e della Brianza · Costruzioni | 37 | 47 | +9 | +9,7% |
| Bergamo · Industria | 40 | 55 | +15 | +11,8% |
| Brescia · Industria | 43 | 71 | +28 | +6,4% |
| Varese · Industria | 13 | 42 | +29 | −10,6% |
| Milano · Industria | 20 | 62 | +42 | −3,7% |
| Monza e della Brianza · Industria | 17 | 77 | +60 | −2,5% |

Nguồn đối chiếu trong dự án: `web/data.json`, `web/model.json`, `data/DATA_SOURCES.md`, hai pipeline tính điểm và huấn luyện, `app/page.tsx`, cùng `app/api/explain/route.ts`. Các kết quả số được đọc từ artifact hiện có; không phải kết quả của một lần huấn luyện hoặc kiểm định mới cho tài liệu này.
