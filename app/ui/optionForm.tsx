import { useEffect } from "react";
import { createOption } from "../lib/actions";

export function OptionForm({ dismissHandler }: { dismissHandler: () => void }) {
  useEffect(() => {

  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 bg-white ml-12 mr-12 p-3 shadow-md">
      <h2>Sold to Open</h2>
      <form action={createOption}>
        <div>
          <label htmlFor="option_type">Type:</label>
          <select id="option_type" name="option_type">
            <option value="CALL">Call</option>
            <option value="PUT">Put</option>
          </select>

          <label htmlFor="stock_symbol">Symbol:</label>
          <input type="text" id="stock_symbol" name="stock_symbol" />

          <label htmlFor="strike_price">Strike:</label>
          <input type="number" id="strike_price" name="strike_price" />

          <label htmlFor="expiration_date">Expiration:</label>
          <input type="date" id="expiration_date" name="expiration_date" />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input type="number" step="0.01" id="price" name="price" />

          <label htmlFor="fee">Fee:</label>
          <input type="number" step="0.01" id="fee" name="fee" />

          <label htmlFor="traded_date">Traded:</label>
          <input type="date" id="traded_date" name="traded_date" />
        </div>
        <div>
          <button type="submit" onClick={dismissHandler}>Save</button>
          <button onClick={dismissHandler}>Cancel</button>
        </div>
      </form>
    </div>
  );
}