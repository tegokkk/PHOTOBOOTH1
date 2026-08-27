DO $$
DECLARE
  target_frame_id text;
BEGIN

  -- Update slots for Beige Friends
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Beige Friends' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0842, 0.0202, 0.8252, 0.3552, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0906, 0.3736, 0.8252, 0.3552, 0, 0);
  END IF;

  -- Update slots for Modern Friends
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Modern Friends' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.057, 0.0463, 0.87, 0.2488, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.057, 0.2988, 0.87, 0.2488, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.057, 0.5484, 0.87, 0.2488, 0, 0);
  END IF;

  -- Update slots for Newspaper Collage
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Newspaper Collage' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0409, 0.1559, 0.4576, 0.2436, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.4998, 0.1559, 0.4576, 0.2436, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0409, 0.3884, 0.4576, 0.2438, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.4998, 0.3884, 0.4576, 0.2438, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0409, 0.621, 0.4576, 0.2436, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.4998, 0.621, 0.4576, 0.2436, 0, 0);
  END IF;

  -- Update slots for Blue & Pink Friendship
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Blue & Pink Friendship' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0959, 0.1318, 0.8087, 0.198, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0959, 0.3157, 0.8087, 0.198, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0959, 0.4995, 0.8087, 0.198, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0959, 0.6833, 0.8087, 0.198, 0, 0);
  END IF;

  -- Update slots for Blue Jeans Modern
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Blue Jeans Modern' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0658, 0.0267, 0.6831, 0.187, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.2311, 0.2513, 0.6755, 0.187, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0663, 0.4756, 0.6853, 0.187, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.2235, 0.7, 0.6831, 0.187, 0, 0);
  END IF;

  -- Update slots for Brown Playful
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Brown Playful' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.1061, 0.1013, 0.7873, 0.2241, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.1061, 0.3368, 0.7873, 0.2241, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.1061, 0.5722, 0.7873, 0.2241, 0, 0);
  END IF;

  -- Update slots for Pink Illustrated Friendship
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Pink Illustrated Friendship' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.1338, 0.0693, 0.7905, 0.2965, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0613, 0.3702, 0.8737, 0.2161, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0655, 0.5921, 0.8652, 0.3086, 0, 0);
  END IF;

  -- Update slots for Pink Strike A Pose
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Pink Strike A Pose' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0633, 0.0629, 0.8314, 0.2017, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.1465, 0.2592, 0.7897, 0.2017, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0633, 0.4557, 0.873, 0.2017, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0633, 0.652, 0.873, 0.1874, 0, 0);
  END IF;

  -- Update slots for Pink Captured In Fun
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Pink Captured In Fun' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0954, 0.0712, 0.8087, 0.2406, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0954, 0.3108, 0.8087, 0.2407, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0954, 0.5504, 0.8087, 0.2407, 0, 0);
  END IF;

  -- Update slots for Purple Vintage Friends
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Purple Vintage Friends' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0306, 0.1888, 0.4322, 0.2228, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5365, 0.1888, 0.4324, 0.2228, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0306, 0.3952, 0.4322, 0.2385, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5365, 0.3952, 0.4324, 0.2385, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0306, 0.6172, 0.4322, 0.2382, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5365, 0.6172, 0.4324, 0.2382, 0, 0);
  END IF;

  -- Update slots for Yellow Girl Gang
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Yellow Girl Gang' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0911, 0.0671, 0.8172, 0.1984, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0911, 0.2995, 0.8172, 0.1984, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0906, 0.5326, 0.8177, 0.1984, 0, 0);
  END IF;

  -- Update slots for Jejak Kebersamaan
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Jejak Kebersamaan' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0143, 0.3239, 0.9728, 0.3064, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.3413, 0.6344, 0.3159, 0.1452, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0143, 0.7643, 0.335, 0.2155, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.6522, 0.7643, 0.3335, 0.2155, 0, 0);
  END IF;

  -- Update slots for OMG Checkerboard
  SELECT id INTO target_frame_id FROM frames WHERE name = 'OMG Checkerboard' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0656, 0.0827, 0.3423, 0.2507, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5437, 0.0739, 0.4244, 0.2732, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0656, 0.3659, 0.3423, 0.2507, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5437, 0.362, 0.4244, 0.2732, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0656, 0.651, 0.3423, 0.2507, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5437, 0.651, 0.4244, 0.2693, 0, 0);
  END IF;

  -- Update slots for Cinema Premiere
  SELECT id INTO target_frame_id FROM frames WHERE name = 'Cinema Premiere' LIMIT 1;
  IF target_frame_id IS NOT NULL THEN
    DELETE FROM frame_slots WHERE frame_id = target_frame_id;
    INSERT INTO frame_slots (id, frame_id, x, y, width, height, rotation, z_index) VALUES
    (gen_random_uuid(), target_frame_id, 0.0808, 0.2299, 0.3852, 0.2102, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5354, 0.2299, 0.3852, 0.2102, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0808, 0.4535, 0.3852, 0.2102, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5354, 0.4535, 0.3852, 0.2102, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.0808, 0.6762, 0.3852, 0.2102, 0, 0),
    (gen_random_uuid(), target_frame_id, 0.5354, 0.6762, 0.3852, 0.2102, 0, 0);
  END IF;
END $$;